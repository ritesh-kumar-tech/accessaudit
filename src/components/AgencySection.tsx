import React, { useState } from 'react';
import { 
  Building2, 
  Palette, 
  FileText, 
  Download, 
  Sparkles, 
  Eye, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AgencyBranding, AuditResult } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';
import { sampleAudits } from '../data/mockAudits';

interface AgencySectionProps {
  agencyBranding: AgencyBranding;
  onUpdateBranding: (branding: Partial<AgencyBranding>) => void;
  onOpenPdfPreview: (audit: AuditResult) => void;
  onSelectPlan: (planId: string) => void;
}

export const AgencySection: React.FC<AgencySectionProps> = ({
  agencyBranding,
  onUpdateBranding,
  onOpenPdfPreview,
  onSelectPlan,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'branded' | 'generic'>('branded');
  
  // Interactive Retainer Revenue ROI Calculator State
  const [clientCount, setClientCount] = useState<number>(8);
  const [auditFee, setAuditFee] = useState<number>(950);
  const [retainerFee, setRetainerFee] = useState<number>(299);

  const initialAuditRevenue = clientCount * auditFee;
  const monthlyRetainerRevenue = clientCount * retainerFee;
  const annualTotalRevenue = initialAuditRevenue + (monthlyRetainerRevenue * 12);
  const accessAuditCost = 79 * 12; // Annual Agency plan cost
  const netAgencyProfit = annualTotalRevenue - accessAuditCost;

  const mockAudit = sampleAudits['example-ecommerce.com'];

  const handleDownloadSample = () => {
    const customAudit: AuditResult = {
      ...mockAudit,
      url: 'client-acme-corp.com',
      overallScore: 68,
      id: 'demo-sample-pdf'
    };
    const doc = generateAuditPdf(customAudit, activePreviewTab === 'branded' ? agencyBranding : undefined);
    doc.save(`${agencyBranding.agencyName.toLowerCase().replace(/\s+/g, '-')}-sample-audit.pdf`);
  };

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-200" id="agency">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-4">
            <Building2 className="w-4 h-4" />
            Built for Web Agencies & Freelancers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
            Stop Sending Ugly Screenshots. Deliver Agency-Grade White-Label Audits.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Customize the 5-page PDF with your logo, color palette, custom recommendations, and contact info. Turn regulatory requirements into high-value client contracts.
          </p>
        </div>

        {/* Interactive Customizer & White-Label Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          
          {/* Left Column: Live Agency Branding Editor */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1E293B] mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E2E8F0]">
                  White-Label Customizer
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Live Preview
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  id="agency-name-input"
                  value={agencyBranding.agencyName}
                  onChange={(e) => onUpdateBranding({ agencyName: e.target.value })}
                  placeholder="e.g. Apex Digital Interactive"
                  className="w-full min-h-[44px] p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#E2E8F0] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  id="agency-tagline-input"
                  value={agencyBranding.tagline}
                  onChange={(e) => onUpdateBranding({ tagline: e.target.value })}
                  placeholder="e.g. Premium Accessibility & Design Engineering"
                  className="w-full min-h-[44px] p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="agency-color-picker"
                      value={agencyBranding.primaryColor}
                      onChange={(e) => onUpdateBranding({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-[#1E293B] p-0.5 bg-white dark:bg-[#0B1120]"
                    />
                    <input
                      type="text"
                      value={agencyBranding.primaryColor}
                      onChange={(e) => onUpdateBranding({ primaryColor: e.target.value })}
                      className="w-full min-h-[44px] p-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="agency-email-input"
                    value={agencyBranding.contactEmail}
                    onChange={(e) => onUpdateBranding({ contactEmail: e.target.value })}
                    placeholder="contact@agency.com"
                    className="w-full min-h-[44px] p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preset Color Themes
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'Trust Blue', hex: '#2563EB' },
                    { name: 'Emerald', hex: '#059669' },
                    { name: 'Violet', hex: '#7C3AED' },
                    { name: 'Midnight', hex: '#0F172A' },
                    { name: 'Rose', hex: '#E11D48' },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => onUpdateBranding({ primaryColor: preset.hex })}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] text-[11px] font-semibold hover:scale-105 transition-transform"
                      style={{ backgroundColor: agencyBranding.primaryColor === preset.hex ? `${preset.hex}15` : undefined }}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.hex }}></span>
                      <span className="text-slate-700 dark:text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B] flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  id="agency-preview-modal-btn"
                  onClick={() => onOpenPdfPreview(mockAudit)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Full PDF Viewer</span>
                </button>

                <button
                  type="button"
                  id="agency-download-pdf-btn"
                  onClick={handleDownloadSample}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .PDF</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: High-Contrast White-Label Comparison Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1E293B] mb-6">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E2E8F0]">
                    White-Label Comparison: Before & After
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    See how your client deliverable transforms from generic software to your branded agency report.
                  </p>
                </div>

                {/* View switcher */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-[#0B1120] rounded-xl text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('generic')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activePreviewTab === 'generic'
                        ? 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Generic / Unbranded
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('branded')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activePreviewTab === 'branded'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    ✨ Your Agency Branded
                  </button>
                </div>
              </div>

              {/* Document Mockup Canvas with striking contrast between Branded (Vibrant) and Generic (Grayscale/Muted) */}
              <div className="p-4 sm:p-6 bg-slate-100 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#1E293B]">
                <div 
                  className={`rounded-2xl border transition-all duration-300 p-6 sm:p-8 ${
                    activePreviewTab === 'branded'
                      ? 'bg-white dark:bg-[#111827] border-blue-200 dark:border-blue-900/60 shadow-2xl ring-2 ring-blue-500/20'
                      : 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 grayscale-[60%] opacity-85 text-slate-500'
                  }`}
                >
                  
                  {/* Mock PDF Header Bar */}
                  <div 
                    className="h-2.5 w-full rounded-full mb-6 transition-colors duration-300"
                    style={{ 
                      backgroundColor: activePreviewTab === 'branded' 
                        ? agencyBranding.primaryColor 
                        : '#94A3B8' 
                    }}
                  ></div>

                  {/* Header Content */}
                  <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-100 dark:border-[#1E293B]">
                    <div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                          style={{ 
                            backgroundColor: activePreviewTab === 'branded' 
                              ? agencyBranding.primaryColor 
                              : '#64748B' 
                          }}
                        >
                          {activePreviewTab === 'branded' ? agencyBranding.agencyName.charAt(0) : 'A'}
                        </div>
                        <h4 
                          className="text-lg font-black tracking-tight"
                          style={{ 
                            color: activePreviewTab === 'branded' 
                              ? agencyBranding.primaryColor 
                              : '#475569' 
                          }}
                        >
                          {activePreviewTab === 'branded' ? agencyBranding.agencyName : 'AccessAudit Free Scan'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {activePreviewTab === 'branded' ? agencyBranding.tagline : 'Standard Automated Diagnostic Result'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                        activePreviewTab === 'branded'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {activePreviewTab === 'branded' ? 'WCAG 2.2 AA Certified Audit' : 'Basic Tier Result'}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-1">Ref #AUD-9482-EAA</span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="mb-6">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                      Target Audit Domain: https://acme-global.com
                    </span>
                    <h5 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                      Comprehensive Website Accessibility & EAA Compliance Report
                    </h5>
                  </div>

                  {/* Mini score row inside mockup */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120]/80 border border-slate-100 dark:border-[#1E293B] mb-6 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Score</span>
                      <span className="text-xl font-black text-amber-500">68/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Blockers</span>
                      <span className="text-xl font-black text-red-500">4 Issues</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Passed Tests</span>
                      <span className="text-xl font-black text-emerald-500">22 Checks</span>
                    </div>
                  </div>

                  {/* Mock Footer CTA / Contact */}
                  <div 
                    className="p-4 rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                    style={{ 
                      backgroundColor: activePreviewTab === 'branded' 
                        ? agencyBranding.primaryColor 
                        : '#475569' 
                    }}
                  >
                    <div>
                      <span className="font-bold block">
                        {activePreviewTab === 'branded' ? `Prepared by ${agencyBranding.agencyName}` : 'Powered by AccessAudit Standard'}
                      </span>
                      <span className="text-[11px] text-white/80">
                        {activePreviewTab === 'branded' ? `Contact: ${agencyBranding.contactEmail}` : 'support@accessaudit.io'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-1 rounded font-bold">
                      {activePreviewTab === 'branded' ? 'CONFIDENTIAL & PROPRIETARY' : 'FREE REPORT'}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Agency Retainer Revenue ROI Calculator (Dark Card Section, Mobile Friendly with min 44px touch targets) */}
        <div className="bg-slate-900 dark:bg-[#111827] rounded-3xl p-6 sm:p-10 lg:p-12 text-white border border-slate-800 dark:border-[#1E293B] shadow-2xl">
          
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Agency ROI & Retainer Profit Calculator
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              How Much Revenue Can Your Agency Generate with AccessAudit?
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Agencies package our 5-page PDF reports into $950+ one-time remediation sprints and charge $299/mo for automated monthly regression monitoring.
            </p>
          </div>

          {/* 1 Column on Mobile, 12 Column on Large */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Slider 1: Active Clients */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Active Retainer Clients:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">{clientCount} Websites</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={clientCount}
                  onChange={(e) => setClientCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 min-h-[44px]"
                  aria-label="Active retainer clients slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 client</span>
                  <span>15 clients</span>
                  <span>30 clients</span>
                </div>
              </div>

              {/* Slider 2: Initial Audit / Remediation Fee */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Initial Audit & Fix Fee (Per Client):</span>
                  <span className="font-mono text-base font-extrabold text-blue-400">${auditFee}</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={3000}
                  step={50}
                  value={auditFee}
                  onChange={(e) => setAuditFee(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-h-[44px]"
                  aria-label="Initial audit fee slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$300</span>
                  <span>$1,500</span>
                  <span>$3,000</span>
                </div>
              </div>

              {/* Slider 3: Monthly Retainer Monitoring */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Monthly Monitoring Retainer (Per Client):</span>
                  <span className="font-mono text-base font-extrabold text-purple-400">${retainerFee}/mo</span>
                </div>
                <input
                  type="range"
                  min={99}
                  max={999}
                  step={20}
                  value={retainerFee}
                  onChange={(e) => setRetainerFee(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 min-h-[44px]"
                  aria-label="Monthly monitoring retainer slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$99/mo</span>
                  <span>$499/mo</span>
                  <span>$999/mo</span>
                </div>
              </div>

            </div>

            {/* Results Box (6 cols on lg) */}
            <div className="lg:col-span-6 bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                  Estimated Agency Net Annual Profit
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ${netAgencyProfit.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ year</span>
                </div>

                <div className="space-y-2.5 py-4 border-y border-slate-700/80 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Initial Audit Deliverables:</span>
                    <span className="font-mono font-bold text-white">${initialAuditRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Recurring Annual Retainers ({clientCount} × ${retainerFee} × 12):</span>
                    <span className="font-mono font-bold text-emerald-400">${(monthlyRetainerRevenue * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AccessAudit Agency Plan (Annual):</span>
                    <span className="font-mono font-bold text-red-400">-${accessAuditCost}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  id="calc-upgrade-agency-btn"
                  onClick={() => onSelectPlan('agency')}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 min-h-[48px]"
                >
                  <span>Start Agency White-Label Trial ($79/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400 text-center block mt-2">
                  Pays for itself with just 1 client in your first week.
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
