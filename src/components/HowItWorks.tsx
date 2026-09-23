import React from 'react';
import { Search, Sparkles, Download, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface HowItWorksProps {
  onScanClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onScanClick }) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const steps = [
    {
      step: '01',
      title: 'Enter URL or Paste Code',
      description: 'Input any public web domain or paste raw HTML/JSX components. Our serverless engine executes deep WCAG 2.2 rule sets in real time.',
      icon: <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    },
    {
      step: '02',
      title: 'Automated 60-Second Audit',
      description: 'Get an instant 0–100 compliance health score, legal risk rating, categorized issue breakdown, and prioritized remediation checklist.',
      icon: <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      step: '03',
      title: 'Export White-Label PDF Report',
      description: 'Download a beautifully formatted 5-page PDF branded with your agency logo and colors to present to clients or send to dev teams.',
      icon: <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    }
  ];

  return (
    <section ref={ref} className={`section-y bg-slate-50 dark:bg-[#0B1120] transition-colors duration-200 fade-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container-wide">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto section-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-xs font-bold text-blue-700 dark:text-blue-300 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simple 3-Step Workflow
          </div>
          <h2 className="text-[30px] sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-[#E2E8F0] tracking-tight">
            How AccessAudit Accelerates Your Compliance Process
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            From first scan to high-value client deliverable in less time than it takes to brew a coffee.
          </p>
        </div>

        {/* 3 Step Cards - 1 col on mobile, 3 col on md+, with a subtle connector line on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          <div className="hidden md:block absolute top-[4.5rem] left-[16.5%] right-[16.5%] h-px bg-slate-200 dark:bg-[#1E293B]" aria-hidden="true"></div>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border transition-all duration-200 relative flex flex-col justify-between h-full hover:-translate-y-1 ${
                idx === 1
                  ? 'border-blue-200 dark:border-blue-800/60 shadow-premium-md ring-1 ring-blue-100 dark:ring-blue-900/40'
                  : 'border-slate-200 dark:border-[#1E293B] shadow-premium-sm hover:shadow-premium-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] mb-3">
                  {step.title}
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant automated execution</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA trigger */}
        <div className="text-center mt-12">
          <button
            onClick={onScanClick}
            className="inline-flex items-center gap-2 px-8 min-h-[48px] bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 text-white font-bold rounded-xl shadow-premium-md hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <span>Run Your First Audit in 60s</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
