import React from 'react';
import { Globe2, Shield, CheckCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const TrustBar: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const partners = [
    { name: 'OmniStudio UK', type: 'Design Agency (London)' },
    { name: 'Nordic Digital AS', type: 'EU Enterprise Web (Stockholm)' },
    { name: 'Vanguard Media', type: 'Shopify Plus Partner (New York)' },
    { name: 'Apex Growth Labs', type: 'SaaS Development (Berlin)' },
    { name: 'CivicWave Tech', type: 'Public Sector Advisory (Austin)' },
  ];

  const standards = [
    { icon: CheckCircle, label: 'W3C WCAG 2.1 & 2.2 AA / AAA', tint: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Shield, label: 'European Accessibility Act (EAA) 2025', tint: 'text-blue-600 dark:text-blue-400' },
    { icon: Globe2, label: 'ADA Title III & Section 508', tint: 'text-slate-500 dark:text-slate-400' },
  ];

  return (
    <section
      ref={ref}
      className={`section-y bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-[#1E293B] transition-colors duration-200 fade-up ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="container-wide">

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
            Trusted by forward-thinking web agencies & digital product teams in EU, UK & US
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch justify-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-[#0B1120]/70 border border-slate-100 dark:border-[#1E293B] hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-[#0B1120] transition-colors text-center group min-h-[80px]"
            >
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {partner.name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {partner.type}
              </span>
            </div>
          ))}
        </div>

        {/* Standards coverage, presented as 3 equal compact cards rather than an inline badge row */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1E293B] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {standards.map(({ icon: Icon, label, tint }, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#0B1120]/50 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium text-center"
            >
              <Icon className={`w-4 h-4 shrink-0 ${tint}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
