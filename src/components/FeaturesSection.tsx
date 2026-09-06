import React from 'react';
import {
  FileText,
  Sparkles,
  Eye,
  CheckSquare,
  BellRing,
  Cpu,
  ShieldCheck,
  Layers,
  Code,
  Palette,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface FeaturesSectionProps {
  onScanClick: () => void;
}

const TINTS = {
  blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
} as const;

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onScanClick }) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const features: { icon: React.ReactNode; tint: keyof typeof TINTS; tag: string; title: string; description: string; highlight: string }[] = [
    {
      icon: <FileText className="w-6 h-6" />,
      tint: 'blue',
      tag: 'Agency Core',
      title: '5-Page White-Label PDF Reports',
      description: 'Generate multi-page PDF audit reports with your agency logo, primary brand colors, custom executive summary, and developer remediation checklist.',
      highlight: 'Custom branding ready'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      tint: 'emerald',
      tag: 'AI Remediation',
      title: 'Actionable Copy-Paste Code Fixes',
      description: 'Never guess how to fix an issue. Every violation includes exact code snippets (HTML, CSS, JSX) showing the exact before and after fixes for your engineering team.',
      highlight: 'Zero guesswork'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      tint: 'purple',
      tag: 'Engine Rule Set',
      title: 'WCAG 2.2 Level AA / AAA Diagnostics',
      description: 'Comprehensive automated checks covering 1.4.3 Contrast, 2.4.7 Focus Appearance, 2.5.8 Target Size, 4.1.2 ARIA Roles, Form Labels, and Document Structure.',
      highlight: 'Full W3C test coverage'
    },
    {
      icon: <BellRing className="w-6 h-6" />,
      tint: 'amber',
      tag: 'Continuous Protection',
      title: 'Weekly Automated Monitoring & Alerts',
      description: 'Set and forget. AccessAudit scans your client sites weekly or monthly and sends instant notifications if a code release introduces new accessibility regressions.',
      highlight: 'Scheduled background scans'
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      tint: 'blue',
      tag: 'Developer Velocity',
      title: 'Fast 60-Second Scan Architecture',
      description: 'Lightweight, lightning-fast DOM crawler analyzes complex single-page apps, React/Vue frontends, and dynamic eCommerce sites without installing extensions.',
      highlight: '60s completion time'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      tint: 'emerald',
      tag: 'Compliance Assurance',
      title: 'EAA & ADA Risk Exposure Rating',
      description: 'Clear legal risk classification (Low, Moderate, High, Severe) helps clients understand liability and justifies budget approvals for remediation projects.',
      highlight: 'Executive clarity'
    }
  ];

  return (
    <section ref={ref} className={`section-y bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#1E293B] transition-colors duration-200 fade-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container-wide">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto section-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-xs font-bold text-blue-700 dark:text-blue-300 mb-4">
            <Layers className="w-3.5 h-3.5" />
            Enterprise-Grade Audit Engine
          </div>
          <h2 className="text-[30px] sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-[#E2E8F0] tracking-tight">
            Everything You Need to Audit, Remediate, and Monitise Accessibility
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Built specifically for web agencies, dev shops, and compliance teams who want to deliver polished client audits without spending 10 hours in manual audits.
          </p>
        </div>

        {/* Feature Grid: 1 col on mobile, 2 col on sm/md, 3 col on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0B1120]/80 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-premium-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform ${TINTS[feature.tint]}`}>
                    {feature.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] px-2.5 py-1 rounded-full border border-slate-200 dark:border-[#1E293B]">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-[#1E293B] flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>{feature.highlight}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
