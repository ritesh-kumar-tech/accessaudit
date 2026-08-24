import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AuditResult, AgencyBranding, PlanTier } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';

interface PdfPreviewModalProps {
  audit: AuditResult;
  agencyBranding: AgencyBranding;
  userPlan?: PlanTier;
  onClose: () => void;
  onUpgrade?: (tier: PlanTier) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  audit,
  agencyBranding,
  userPlan = 'agency',
  onClose,
  onUpgrade,
}) => {
  const [activeTier, setActiveTier] = useState<PlanTier>(userPlan);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [useAgencyBranding, setUseAgencyBranding] = useState<boolean>(activeTier === 'agency');

  const totalPages = activeTier === 'free' ? 2 : (activeTier === 'pro' ? 4 : 5);
  const brandName = (activeTier === 'agency' && useAgencyBranding) ? agencyBranding.agencyName : 'AccessAudit';
  const primaryColor = (activeTier === 'agency' && useAgencyBranding) ? agencyBranding.primaryColor : '#2563EB';

  const handleDownload = () => {
    const doc = generateAuditPdf(audit, useAgencyBranding ? agencyBranding : undefined, activeTier);
    doc.save(`${brandName.toLowerCase().replace(/\s+/g, '-')}-${activeTier}-accessibility-report.pdf`);
  };

  const handleTierChange = (tier: PlanTier) => {
    setActiveTier(tier);
    setCurrentPage(1);
    if (tier === 'agency') {
      setUseAgencyBranding(true);
    } else {
      setUseAgencyBranding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Tiered PDF Report Inspector
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  {activeTier.toUpperCase()} EDITION
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {audit.url} • {totalPages} Pages in This Plan
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Plan Tier Switcher for Demo/Preview */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => handleTierChange('free')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTier === 'free' ? 'bg-slate-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Free Plan (Locked)
              </button>
              <button
                onClick={() => handleTierChange('pro')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTier === 'pro' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pro Plan
              </button>
              <button
                onClick={() => handleTierChange('agency')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTier === 'agency' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Agency White-Label
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plan Feature Summary Banner */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            {activeTier === 'free' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Free Tier: Executive Summary only. Detailed issue list & code fixes locked.
              </span>
            )}
            {activeTier === 'pro' && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pro Tier: Complete Executive Summary + Developer code fixes + Checklist.
              </span>
            )}
            {activeTier === 'agency' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Agency Tier: 100% White-Label + Multi-site portfolio comparison + Roadmap.
              </span>
            )}
          </div>

          {activeTier === 'free' && onUpgrade && (
            <button
              onClick={() => {
                onClose();
                onUpgrade('pro');
              }}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Unlock Full Pro Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Page Selector Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120]">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const pageTitles = [
                '1. Cover & Traffic-Light Score',
                '2. Executive Summary (Business)',
                activeTier === 'free' ? '3. Developer Findings (Locked)' : '3. Developer Details',
                '4. Remediation Checklist',
                '5. Agency Portfolio & Roadmap'
              ];

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {activeTier === 'free' && pageNum === 2 && <Lock className="w-3 h-3 text-amber-300" />}
                  <span>{pageTitles[i]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Content Simulator */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-[#080d1a] flex justify-center">
          <div className="bg-white text-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 p-8 sm:p-10 font-sans min-h-[640px] flex flex-col justify-between relative">
            
            {/* Header Stamp */}
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-blue-600 uppercase">{brandName}</span>
                <span>• WCAG 2.2 Compliance</span>
              </div>
              <span>{audit.url}</span>
            </div>

            {/* PAGE 1: COVER */}
            {currentPage === 1 && (
              <div className="py-6 space-y-6 my-auto">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {activeTier === 'agency' && useAgencyBranding ? agencyBranding.tagline : 'Official Accessibility Audit'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Website Accessibility & Executive Compliance Report
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <p className="text-slate-500 uppercase font-semibold text-[10px]">Target Domain</p>
                    <p className="font-bold text-slate-900 truncate">{audit.url}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase font-semibold text-[10px]">Audit Date</p>
                    <p className="font-bold text-slate-900">{audit.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase font-semibold text-[10px]">Benchmark Standard</p>
                    <p className="font-bold text-slate-900">W3C WCAG 2.2 AA / ADA Title III</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase font-semibold text-[10px]">Legal Risk Exposure</p>
                    <p className="font-bold text-red-600">{audit.legalRiskLevel} Risk Level</p>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase">Overall WCAG Health Score</p>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-5xl font-extrabold text-blue-600">{audit.overallScore}</span>
                      <span className="text-slate-400 font-bold text-lg">/ 100</span>
                    </div>
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                      TRAFFIC LIGHT: {audit.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-xs">
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-center">
                      <span className="block text-lg font-bold text-red-600">{audit.criticalCount}</span>
                      <span className="text-[10px] font-bold text-red-700 uppercase">Critical (Red)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <span className="block text-lg font-bold text-amber-600">{audit.moderateCount}</span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Moderate (Amber)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <span className="block text-lg font-bold text-slate-600">{audit.minorCount}</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Minor (Gray)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <span className="block text-lg font-bold text-emerald-600">{audit.passedCount}</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Passed (Green)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2: EXECUTIVE SUMMARY (FOR BUSINESS OWNERS) */}
            {currentPage === 2 && (
              <div className="py-4 space-y-5 my-auto">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                    Business Owner Briefing
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Executive Summary (Plain Language)
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-level compliance status without dense engineering jargon.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900">What This Score Means for Your Business:</p>
                  <p className="leading-relaxed">
                    {audit.plainExecutiveSummary || audit.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                    Top 3 Priority Fixes (Actionable Roadmap)
                  </h3>
                  <div className="space-y-2.5">
                    {(audit.topPriorityFixes || [
                      'Fix low-contrast buttons so low-vision shoppers can find and click checkout actions.',
                      'Add descriptive text to catalog images so screen-reader users can explore your products.',
                      'Ensure popup modals allow keyboard users to tab through and dismiss with the Escape key.'
                    ]).map((prio, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3 text-xs">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'bg-red-500' : (idx === 1 ? 'bg-amber-500' : 'bg-blue-600')
                        }`}>
                          {idx + 1}
                        </span>
                        <p className="text-slate-800 font-medium leading-relaxed">{prio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {activeTier === 'free' && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-2">
                    <p className="text-xs font-bold text-blue-900">
                      Looking for the exact code fixes & developer checklist?
                    </p>
                    <p className="text-[11px] text-blue-700">
                      The free tier includes this executive summary. Upgrade to Pro for complete technical remediation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 3: DEVELOPER DETAILS (OR LOCKED IF FREE) */}
            {currentPage === 3 && (
              <div className="py-4 space-y-4 my-auto relative">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                    Developer Details
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Categorized WCAG 2.2 Findings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Visual groupings with plain-language context and code fixes.
                  </p>
                </div>

                {activeTier === 'free' ? (
                  /* Locked state overlay */
                  <div className="relative rounded-2xl border border-slate-200 p-6 bg-slate-50/80 overflow-hidden text-center space-y-4">
                    {/* Blurred fake content */}
                    <div className="filter blur-xs opacity-40 space-y-3 select-none pointer-events-none">
                      <div className="h-6 bg-slate-300 rounded-md w-3/4"></div>
                      <div className="h-12 bg-slate-200 rounded-md"></div>
                      <div className="h-6 bg-slate-300 rounded-md w-1/2"></div>
                      <div className="h-12 bg-slate-200 rounded-md"></div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-md">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Developer Code Patches Locked in Free Plan
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mt-1">
                        Unlock exact CSS selectors, faulty vs. corrected HTML snippets, and automated monitoring.
                      </p>
                      {onUpgrade && (
                        <button
                          onClick={() => {
                            onClose();
                            onUpgrade('pro');
                          }}
                          className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                        >
                          Upgrade to Pro Plan ($49/mo)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Unlocked Issue list */
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {audit.issues.slice(0, 3).map((issue) => (
                      <div key={issue.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                            issue.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{issue.wcagRule}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{issue.title}</h4>
                        <p className="text-slate-600 text-[11px] italic">"{issue.plainSummary || issue.description}"</p>
                        {issue.codeSnippetFix && (
                          <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px]">
                            {issue.codeSnippetFix.split('\n')[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGE 4: CHECKLIST */}
            {currentPage === 4 && (
              <div className="py-4 space-y-4 my-auto">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                    Engineering Roadmap
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Developer Remediation Checklist
                  </h2>
                  <p className="text-xs text-slate-500">
                    Prioritized tasks with estimated completion times.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[10px] uppercase">
                    <span className="col-span-2">Priority</span>
                    <span className="col-span-2">Rule</span>
                    <span className="col-span-6">Action Item</span>
                    <span className="col-span-2 text-right">Est. Time</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {audit.checklist.map((item) => (
                      <div key={item.id} className="p-2.5 grid grid-cols-12 gap-2 items-center text-slate-800">
                        <span className={`col-span-2 font-bold text-[10px] uppercase ${
                          item.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="col-span-2 font-mono text-[10px] text-slate-500">{item.wcagRule}</span>
                        <span className="col-span-6 font-medium truncate">{item.task}</span>
                        <span className="col-span-2 text-right text-slate-500 font-mono text-[10px]">~{item.estimatedMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 5: AGENCY PORTFOLIO & ROADMAP */}
            {currentPage === 5 && (
              <div className="py-4 space-y-4 my-auto">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-600">
                    Agency Tier Exclusive
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Portfolio Benchmark & 3-Phase Roadmap
                  </h2>
                  <p className="text-xs text-slate-500">
                    Multi-client cross-comparison and enterprise implementation timeline.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Agency 3-Phase Remediation Roadmap:</p>
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <p><strong className="text-blue-600">Phase 1 (Days 1–7):</strong> Remediate all Red traffic-light blockers (form labels & contrast).</p>
                    <p><strong className="text-blue-600">Phase 2 (Days 8–21):</strong> Keyboard navigation, focus rings & modal focus containment.</p>
                    <p><strong className="text-blue-600">Phase 3 (Day 22+):</strong> Automated weekly CI/CD monitoring & formal WCAG 2.2 AA signoff.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-600 text-white space-y-1 text-xs">
                  <p className="font-extrabold text-sm">{brandName}</p>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    Custom white-labeled compliance report prepared for {audit.url}.
                  </p>
                  <p className="text-[10px] text-blue-200 pt-1">
                    Contact: {agencyBranding.contactEmail} • Website: {agencyBranding.website}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Stamp */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>CONFIDENTIAL • {audit.url}</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
