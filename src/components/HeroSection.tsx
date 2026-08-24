import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Check, 
  Code2,
  Lock,
  Layers
} from 'lucide-react';
import { sampleAudits } from '../data/mockAudits';
import { AuditResult, AgencyBranding } from '../types';

interface HeroSectionProps {
  onRunScan: (targetUrl: string, htmlSnippet?: string) => void;
  onOpenPdfPreview: (audit: AuditResult) => void;
  sampleAudit: AuditResult;
  isScanning: boolean;
  agencyBranding: AgencyBranding;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRunScan,
  onOpenPdfPreview,
  sampleAudit,
  isScanning,
  agencyBranding,
}) => {
  const [urlInput, setUrlInput] = useState('https://www.luxe-apparel.store');
  const [activeTab, setActiveTab] = useState<'url' | 'code'>('url');
  const [customHtml, setCustomHtml] = useState(
`<button class="bg-gray-200 text-gray-400">Checkout</button>
<img src="/banner.png" />
<input type="text" placeholder="Your email address" />`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url') {
      if (urlInput.trim()) {
        onRunScan(urlInput.trim());
      }
    } else {
      if (customHtml.trim()) {
        onRunScan('Custom Component Snippet', customHtml);
      }
    }
  };

  const handleSelectPreset = (domain: string) => {
    setUrlInput(domain.startsWith('http') ? domain : `https://${domain}`);
    setActiveTab('url');
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC] dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120] transition-colors duration-200">
      
      {/* Background ambient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-60 dark:opacity-20">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Eyebrow Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-blue-200/80 dark:border-[#1E293B] shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">New:</span> European Accessibility Act (EAA) & WCAG 2.2 Ready
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-0.5" />
          </div>
        </div>

        {/* Hero Title & Subheadline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight leading-[1.12]">
            Find Every Accessibility Issue on Your Website in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 dark:from-blue-400 dark:via-blue-500 dark:to-emerald-400 bg-clip-text text-transparent">
              60 Seconds.
            </span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automated WCAG 2.2 AA and ADA Title III compliance diagnostics for agencies, developers, and digital brands. Generate executive-ready PDF audit reports instantly.
          </p>
        </div>

        {/* Main Interactive Scanner Input Container */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-3.5 sm:p-5 shadow-xl shadow-slate-200/70 dark:shadow-black/40 border border-slate-200 dark:border-[#1E293B] transition-colors">
            
            {/* Input Mode Toggle Tabs */}
            <div className="flex items-center justify-between mb-3.5 px-1 border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="tab-url-mode"
                  onClick={() => setActiveTab('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'url'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Website URL
                </button>
                <button
                  type="button"
                  id="tab-code-mode"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Paste HTML / Component
                </button>
              </div>

              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Free instant analysis • No credit card
              </span>
            </div>

            {/* Form: URL input & Stacked on Mobile */}
            <form onSubmit={handleSubmit}>
              {activeTab === 'url' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      id="hero-url-input"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      required
                      className="block w-full min-h-[48px] pl-11 pr-4 py-3.5 text-slate-900 dark:text-[#E2E8F0] font-medium placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-50/80 dark:hover:bg-[#0B1120]/80 focus:bg-white dark:focus:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    id="hero-scan-submit-btn"
                    disabled={isScanning}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/20 hover:shadow-xl transition-all text-base whitespace-nowrap active:scale-98 min-h-[48px]"
                  >
                    <span>Run Free Scan</span>
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    id="hero-html-input"
                    rows={3}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="Paste HTML code snippet or JSX here..."
                    className="w-full p-3 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      id="hero-code-submit-btn"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 text-white font-extrabold rounded-xl shadow-md text-sm hover:opacity-95 transition-opacity min-h-[44px]"
                    >
                      <span>Analyze Code Snippet</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Preset shortcuts */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Try sample sites:</span>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://www.luxe-apparel.store')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                🛍️ E-Commerce (Score 68)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://cloudflow-analytics.io')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                ⚡ SaaS App (Score 84)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://metrohealth-care.org')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                🏥 Healthcare (Score 54)
              </button>
            </div>

          </div>
        </div>

        {/* Enlarged Mockup Result Card (+20% scale, prominent soft glow/shadow as key proof element) */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl shadow-blue-500/10 dark:shadow-black/60 border border-slate-200/90 dark:border-[#1E293B] ring-1 ring-blue-500/20 dark:ring-blue-500/10 relative transition-all">
            
            {/* Top Bar of Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#1E293B]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-xs">
                  🛍️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-[#E2E8F0] text-lg sm:text-xl">luxe-apparel.store</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Audit Sample
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Scanned 342 DOM nodes • W3C WCAG 2.2 AA Benchmark
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="hero-mockup-pdf-btn"
                  onClick={() => onOpenPdfPreview(sampleAudit)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => onRunScan('https://www.luxe-apparel.store')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>Explore Findings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Score & Issue Breakdown Grid (Enlarged Gauge Card) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-6 items-center">
              
              {/* Score Gauge Block (~20% larger with circular glowing aesthetic) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/90 dark:bg-[#0B1120]/80 rounded-2xl border border-slate-100 dark:border-[#1E293B] text-center shadow-inner">
                <div className="relative w-38 h-38 sm:w-40 sm:h-40 flex items-center justify-center mb-3">
                  <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="41"
                      fill="transparent"
                      stroke="#E2E8F0"
                      strokeWidth="9"
                      className="dark:stroke-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="41"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="9"
                      strokeDasharray="257.6"
                      strokeDashoffset={257.6 - (257.6 * 68) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">68</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">/ 100 Score</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Remediation
                </span>
              </div>

              {/* Badges and Findings List */}
              <div className="md:col-span-8 space-y-3.5">
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    4 Critical Violations
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    6 Moderate Issues
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    22 Passed Checks
                  </div>
                </div>

                {/* Sample finding row items */}
                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-black text-[10px]">CRITICAL</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Add to Cart button text contrast fails 4.5:1 ratio</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] hidden sm:inline">WCAG 1.4.3</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-black text-[10px]">CRITICAL</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Missing alt attributes on 5 product gallery thumbnails</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] hidden sm:inline">WCAG 1.1.1</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px]">MODERATE</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Keyboard focus trap inside shopping cart drawer</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] hidden sm:inline">WCAG 2.1.2</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
