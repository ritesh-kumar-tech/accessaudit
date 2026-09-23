import { Router, RequestHandler } from 'express';
import Razorpay from 'razorpay';
import { razorpay } from '../services/razorpayServer';
import { supabaseAdmin, getUserFromAuthHeader } from '../services/supabaseServer';
import { PLAN_IDS, BillingCycle } from './razorpayPlanMap';

// ~10 years of monthly cycles -- Razorpay subscriptions require a finite
// total_count; this is effectively "until the customer cancels."
const SUBSCRIPTION_TOTAL_COUNT = 120;

/**
 * POST /api/checkout -- creates a Razorpay subscription for the caller and
 * returns its hosted short_url (supports UPI/cards/netbanking) to redirect
 * the browser to. The actual plan upgrade only happens once the webhook
 * below confirms payment -- this endpoint never touches profiles/subscriptions.
 */
export function createCheckoutRouter(): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    if (!razorpay) return res.status(503).json({ error: 'Payments are not configured on the server yet.' });

    const user = await getUserFromAuthHeader(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Sign in to subscribe.' });

    const { tier, billingCycle } = req.body as { tier?: string; billingCycle?: string };
    if (tier !== 'pro' && tier !== 'agency') {
      return res.status(400).json({ error: 'Invalid plan tier.' });
    }
    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return res.status(400).json({ error: 'Invalid billing cycle.' });
    }

    const planId = PLAN_IDS[tier][billingCycle as BillingCycle];
    if (!planId) {
      return res.status(503).json({ error: `No Razorpay plan is configured yet for ${tier}/${billingCycle}.` });
    }

    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: SUBSCRIPTION_TOTAL_COUNT,
        notes: { user_id: user.id, tier },
      });
      res.json({ url: subscription.short_url });
    } catch (err) {
      console.error('Razorpay checkout creation failed:', err);
      res.status(502).json({ error: 'Could not start checkout. Please try again.' });
    }
  });

  return router;
}

interface RazorpaySubscriptionNotes {
  user_id?: string;
  tier?: string;
}

async function handleRazorpayEvent(eventType: string, subscription: any, payment: any): Promise<void> {
  if (!supabaseAdmin) return;
  const notes: RazorpaySubscriptionNotes = subscription?.notes || {};

  switch (eventType) {
    case 'subscription.activated': {
      if (!subscription || !notes.user_id || !notes.tier) return;
      await supabaseAdmin.from('subscriptions').upsert(
        {
          user_id: notes.user_id,
          razorpay_subscription_id: subscription.id,
          razorpay_customer_id: subscription.customer_id,
          plan: notes.tier,
          status: 'active',
          price_id: subscription.plan_id,
          current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'razorpay_subscription_id' }
      );
      await supabaseAdmin.from('profiles').update({ plan: notes.tier }).eq('id', notes.user_id);
      break;
    }

    case 'subscription.charged': {
      if (!subscription) return;
      if (payment) {
        await supabaseAdmin.from('payments').insert({
          user_id: notes.user_id || null,
          razorpay_payment_id: payment.id,
          amount: (payment.amount || 0) / 100,
          currency: (payment.currency || 'INR').toLowerCase(),
          plan: notes.tier,
          status: 'succeeded',
        });
      }
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subscription.id);
      break;
    }

    case 'subscription.cancelled': {
      if (!subscription) return;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('razorpay_subscription_id', subscription.id);
      if (notes.user_id) {
        await supabaseAdmin.from('profiles').update({ plan: 'free' }).eq('id', notes.user_id);
      }
      break;
    }

    case 'subscription.halted':
    case 'payment.failed': {
      if (subscription) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('razorpay_subscription_id', subscription.id);
      }
      if (payment) {
        await supabaseAdmin.from('payments').insert({
          user_id: notes.user_id || null,
          razorpay_payment_id: payment.id,
          amount: (payment.amount || 0) / 100,
          currency: (payment.currency || 'INR').toLowerCase(),
          plan: notes.tier,
          status: 'failed',
          failure_reason: payment.error_description || null,
        });
      }
      break;
    }

    default:
      break;
  }
}

/**
 * POST /api/checkout/webhook -- must be mounted with express.raw() BEFORE the
 * app's global express.json() (see server.ts), since Razorpay's signature is
 * computed over the exact raw request bytes.
 */
export function createCheckoutWebhookHandler(): RequestHandler {
  return async (req, res) => {
    if (!supabaseAdmin) return res.status(503).end();

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    if (!secret || typeof signature !== 'string' || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: 'Missing signature or webhook secret.' });
    }

    const rawBody = req.body.toString('utf8');
    const isValid = Razorpay.validateWebhookSignature(rawBody, signature, secret);
    if (!isValid) return res.status(400).json({ error: 'Invalid webhook signature.' });

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;
    const subscriptionEntity = event.payload?.subscription?.entity;
    const paymentEntity = event.payload?.payment?.entity;
    const primaryId = subscriptionEntity?.id || paymentEntity?.id || 'unknown';
    const idempotencyKey = `${eventType}:${primaryId}`;

    const { data: existing } = await supabaseAdmin
      .from('webhook_events')
      .select('id, processed_status')
      .eq('razorpay_event_id', idempotencyKey)
      .maybeSingle();

    if (existing?.processed_status === 'processed') {
      return res.json({ received: true, deduped: true });
    }

    const { data: eventRow } = await supabaseAdmin
      .from('webhook_events')
      .upsert(
        { razorpay_event_id: idempotencyKey, event_type: eventType, processed_status: 'pending' },
        { onConflict: 'razorpay_event_id' }
      )
      .select('id')
      .single();

    try {
      await handleRazorpayEvent(eventType, subscriptionEntity, paymentEntity);
      if (eventRow) {
        await supabaseAdmin.from('webhook_events').update({ processed_status: 'processed' }).eq('id', eventRow.id);
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error('Razorpay webhook processing failed:', err);
      if (eventRow) {
        await supabaseAdmin
          .from('webhook_events')
          .update({ processed_status: 'failed', processing_error: err?.message || 'Unknown error' })
          .eq('id', eventRow.id);
      }
      res.status(500).json({ error: 'Webhook processing failed.' });
    }
  };
}
