import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Building2, 
  Zap, 
  ArrowRight, 
  HelpCircle,
  ShieldCheck,
  Star
} from 'lucide-react';
import { PricingTier } from '../types';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
  onScanClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, onScanClick }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans: PricingTier[] = [
    {
      id: 'free',
      tier: 'free',
      name: 'Free Scan',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for spot-checking a single landing page or personal project.',
      features: [
        '1 website scan / day',
        'Basic WCAG 2.2 score (0–100)',
        'Top 5 critical issues detected',
        'Web summary view',
        'Community discord support',
      ],
      ctaText: 'Start Free Scan',
      popular: false,
    },
    {
      id: 'starter',
      tier: 'pro',
      name: 'Starter',
      priceMonthly: 29,
      priceAnnual: 24,
      description: 'For freelance web designers & solo frontend developers.',
      features: [
        '50 website scans / month',
        'Full WCAG 2.2 AA diagnostics',
        'Standard PDF audit report',
        'Copy-paste code remediation snippets',
        'EAA & ADA legal risk assessment',
        'Email customer support',
      ],
      ctaText: 'Choose Starter',
      popular: false,
    },
    {
      id: 'agency',
      tier: 'agency',
      name: 'Agency White-Label',
      priceMonthly: 99,
      priceAnnual: 79,
      description: 'Our most popular plan for digital agencies selling accessibility retainers.',
      features: [
        'Unlimited website audits',
        '5-Page White-Label PDF Reports (Your Logo & Colors)',
        'Custom agency header, tagline & contact footer',
        'Continuous weekly domain monitoring & alerts',
        'Client-ready executive summaries & sprint checklists',
        '10 Team seats included',
        'Priority technical support',
      ],
      ctaText: 'Start Agency Trial',
      popular: true,
    },
    {
      id: 'enterprise',
      tier: 'agency',
      name: 'Custom / API',
      priceMonthly: 249,
      priceAnnual: 199,
      description: 'For enterprise organizations requiring automated CI/CD pipeline integration.',
      features: [
        'Everything in Agency White-Label',
        'REST API & Webhooks access',
        'GitHub Actions / CI/CD pipeline blocking',
        'Unlimited client monitoring domains',
        'Custom SLA & dedicated compliance engineer',
        'SSO / SAML authentication',
        'Custom invoice billing',
      ],
      ctaText: 'Contact Enterprise',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-xs font-bold text-blue-700 dark:text-blue-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#E2E8F0] tracking-tight">
            Plans That Pay for Themselves on Your First Client Audit
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate your first white-label client PDF audit in 60 seconds. Upgrade or cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-[#E2E8F0]' : 'text-slate-500 dark:text-slate-400'}`}>
              Monthly billing
            </span>
            <button
              type="button"
              id="billing-cycle-toggle-btn"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Toggle annual billing"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8 bg-blue-600' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${billingCycle === 'annual' ? 'text-slate-900 dark:text-[#E2E8F0]' : 'text-slate-500 dark:text-slate-400'}`}>
                Annual billing
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Equal-Height Pricing Cards Grid (1 col on mobile, 2 col on md, 4 col on lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch mb-16">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const isAgency = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all h-full ${
                  isAgency
                    ? 'bg-slate-900 dark:bg-[#0B1120] text-white shadow-2xl ring-2 ring-blue-500/50 scale-100 lg:-translate-y-2'
                    : 'bg-slate-50/80 dark:bg-[#0B1120]/70 text-slate-900 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1E293B] hover:shadow-lg'
                }`}
              >
                {/* Popular Tag for Agency White-Label */}
                {isAgency && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      <Star className="w-3 h-3 fill-current" /> Recommended for Agencies
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-black ${isAgency ? 'text-white' : 'text-slate-900 dark:text-[#E2E8F0]'}`}>
                      {plan.name}
                    </h3>
                  </div>

                  <p className={`text-xs min-h-[36px] ${isAgency ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {plan.description}
                  </p>

                  {/* Price display */}
                  <div className="my-6 pb-6 border-b border-slate-200 dark:border-[#1E293B]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight">
                        ${price}
                      </span>
                      <span className={`text-xs font-semibold ${isAgency ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {price === 0 ? 'forever' : '/month'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && price > 0 && (
                      <span className={`text-[11px] font-medium block mt-1 ${isAgency ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        Billed annually (${price * 12}/yr)
                      </span>
                    )}
                  </div>

                  {/* Feature Bullets with increased line-height and generous spacing */}
                  <div className="space-y-3.5 mb-8">
                    <span className={`text-[11px] font-bold uppercase tracking-wider block ${isAgency ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      Included Features:
                    </span>
                    <ul className="space-y-3.5 text-xs">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isAgency ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                          <span className={isAgency ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA button */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => {
                      if (plan.id === 'free') {
                        onScanClick();
                      } else {
                        onSelectPlan(plan.id);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px] ${
                      isAgency
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#1E293B]'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0]">14-Day Money-Back Guarantee</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Try Agency White-Label risk-free. If it doesn't help you land a client retainer, get a 100% refund.</p>
            </div>
          </div>
          <button
            onClick={onScanClick}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Start with Free Scan First →
          </button>
        </div>

      </div>
    </section>
  );
};
