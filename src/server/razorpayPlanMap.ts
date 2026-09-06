import type { PlanTier } from '../types';

export type BillingCycle = 'monthly' | 'annual';

/**
 * Maps (tier, billingCycle) to a Razorpay Plan id created in the dashboard
 * (test mode for now). Populate these env vars once the plans exist there.
 */
export const PLAN_IDS: Record<Exclude<PlanTier, 'free'>, Record<BillingCycle, string | undefined>> = {
  pro: {
    monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    annual: process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  },
  agency: {
    monthly: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
    annual: process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
  },
};
