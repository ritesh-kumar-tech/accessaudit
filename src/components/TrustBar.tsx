import React from 'react';
import { Globe2, Shield, CheckCircle } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const partners = [
    { name: 'OmniStudio UK', type: 'Design Agency (London)' },
    { name: 'Nordic Digital AS', type: 'EU Enterprise Web (Stockholm)' },
    { name: 'Vanguard Media', type: 'Shopify Plus Partner (New York)' },
    { name: 'Apex Growth Labs', type: 'SaaS Development (Berlin)' },
    { name: 'CivicWave Tech', type: 'Public Sector Advisory (Austin)' },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
            Trusted by forward-thinking web agencies & digital product teams in EU, UK & US
          </p>
        </div>

        {/* 2-col on mobile, 3-col on sm, 5-col on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 items-center justify-center">
          {partners.map((partner, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-[#0B1120]/70 border border-slate-100 dark:border-[#1E293B] hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-[#0B1120] transition-colors text-center group min-h-[72px]"
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

        {/* Legal & Standards badge bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1E293B] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>W3C WCAG 2.1 & 2.2 AA / AAA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>European Accessibility Act (EAA) 2025</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>ADA Title III & Section 508</span>
          </div>
        </div>

      </div>
    </section>
  );
};
