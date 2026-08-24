import React from 'react';
import { 
  Scale, 
  Euro, 
  FileWarning, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingDown 
} from 'lucide-react';

interface ProblemSectionProps {
  onScanClick: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onScanClick }) => {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-xs font-bold text-red-700 dark:text-red-300 mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            Compliance Reality Check
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#E2E8F0] tracking-tight">
            Why 96.8% of Top Websites Fail Basic Accessibility Rules
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Accessibility isn't just an ethical priority anymore—it's a strict regulatory standard carrying substantial financial penalties and legal liability across the globe.
          </p>
        </div>

        {/* 3 Problem Cards - 1 col on mobile, 3 col on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          
          {/* Card 1: EAA Deadline */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                <Euro className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                EU Directive 2019/882
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] mt-3">
                European Accessibility Act (EAA) Mandatory Enforcement
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                By June 28, 2025, any business selling products or digital services to EU consumers must comply with EN 301 549 (WCAG 2.1 AA). Non-compliance triggers state fines up to €100,000+ per member state.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
              <span>Fines up to €100k</span>
              <span>June 2025 Deadline</span>
            </div>
          </div>

          {/* Card 2: ADA Lawsuits */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                US ADA Title III
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] mt-3">
                4,000+ Federal Accessibility Lawsuits Filed Annually
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Plaintiffs' law firms use automated scrapers to target e-commerce and SaaS websites with missing form labels, color contrast failures, and broken keyboard navigation. Average settlement: $25,000 – $50,000.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs text-red-700 dark:text-red-400 font-semibold">
              <span>$25k–$50k avg cost</span>
              <span>15% YoY increase</span>
            </div>
          </div>

          {/* Card 3: Agency Retainer Opportunity */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Agency Revenue
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] mt-3">
                Turn Compliance Audits into High-Margin Retainers
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Clients are actively asking for accessibility assurances. Deliver white-labeled 5-page PDF reports with your logo, upsell $1,500 remediation sprints, and bill $299/mo for automated monthly monitoring.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>$2,500/mo potential</span>
              <span>Ready in 60 seconds</span>
            </div>
          </div>

        </div>

        {/* Call to action banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 dark:from-[#111827] dark:via-[#111827] dark:to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800 dark:border-[#1E293B]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Are your client websites exposed to risk?</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Run an instant non-destructive WCAG 2.2 audit now. Get a complete score and violation checklist in 60 seconds.
            </p>
          </div>
          <button
            onClick={onScanClick}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all shrink-0 active:scale-98 min-h-[44px]"
          >
            <span>Scan Domain Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
