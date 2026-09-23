-- ============================================================
-- Switch billing provider from Stripe to Razorpay. No real billing data
-- exists yet (subscriptions/payments/webhook_events are still empty per
-- the comment in 0002), so this simply renames the provider-specific
-- columns rather than migrating data.
-- ============================================================
alter table public.subscriptions rename column stripe_customer_id to razorpay_customer_id;
alter table public.subscriptions rename column stripe_subscription_id to razorpay_subscription_id;

alter table public.payments rename column stripe_payment_intent_id to razorpay_payment_id;
alter table public.payments rename column stripe_invoice_id to razorpay_invoice_id;

alter table public.webhook_events rename column stripe_event_id to razorpay_event_id;

-- Razorpay is INR-first (Stripe's 'usd' default no longer fits).
alter table public.subscriptions alter column currency set default 'inr';
alter table public.payments alter column currency set default 'inr';
