import type { PlanTier } from '../types';

export type BillingCycle = 'monthly' | 'annual';

/**
 * Maps (tier, billingCycle) to a Razorpay Plan id created in the dashboard
 * (test mode for now). Populate these env vars once the plans exist there.
 *
 * The internal tier for the "Starter" plan (as shown on the pricing page)
 * stays 'pro' -- that's the PlanTier value used for entitlement checks
 * throughout the app, and it's never displayed to users or sent to Razorpay,
 * so renaming it would be pure churn. What *does* use the "Starter" name is
 * the env var: RAZORPAY_PLAN_STARTER_* is the primary name going forward,
 * with RAZORPAY_PLAN_PRO_* kept as a fallback alias for any deployment that
 * already set the old names.
 */
export const PLAN_IDS: Record<Exclude<PlanTier, 'free'>, Record<BillingCycle, string | undefined>> = {
  pro: {
    monthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY || process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    annual: process.env.RAZORPAY_PLAN_STARTER_ANNUAL || process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  },
  agency: {
    monthly: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
    annual: process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
  },
};
