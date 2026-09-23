import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Check, Code2 } from 'lucide-react';

interface HeroSectionProps {
  onRunScan: (targetUrl: string, htmlSnippet?: string) => void;
  onExploreSample: () => void;
  isScanning: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRunScan,
  onExploreSample,
  isScanning,
}) => {
  const [urlInput, setUrlInput] = useState('');
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
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-14 w-full bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC] dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120] transition-colors duration-200">

      {/* Background: soft blue/cyan/teal color washes at the sides + flowing wave
          lines hugging the bottom edge, all CSS/SVG (no image, no text). Kept out
          of the horizontal/vertical center so the headline and scan box sit on a
          clean, light area. Contained to this section only (parent's overflow-hidden
          clips it, and it's positioned absolute within this section's own box). */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-300/25 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-300/25 dark:bg-blue-500/10 rounded-full blur-3xl"></div>

        <svg
          className="absolute inset-x-0 bottom-0 w-full h-1/2 sm:h-[55%]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="hero-wave-a" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="50%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#5EEAD4" />
            </linearGradient>
            <linearGradient id="hero-wave-b" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BFDBFE" />
              <stop offset="50%" stopColor="#A5F3FC" />
              <stop offset="100%" stopColor="#99F6E4" />
            </linearGradient>
          </defs>
          <path
            d="M0,220 C240,160 480,280 720,220 C960,160 1200,260 1440,200 L1440,400 L0,400 Z"
            fill="url(#hero-wave-a)"
            className="opacity-[0.18] dark:opacity-[0.08]"
          />
          <path
            d="M0,280 C260,320 500,240 760,290 C1020,340 1220,260 1440,300 L1440,400 L0,400 Z"
            fill="url(#hero-wave-b)"
            className="opacity-[0.22] dark:opacity-[0.1]"
          />
          <path
            d="M0,340 C300,310 620,360 900,330 C1140,305 1300,345 1440,330 L1440,400 L0,400 Z"
            fill="url(#hero-wave-b)"
            className="opacity-[0.15] dark:opacity-[0.07]"
          />
        </svg>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Eyebrow Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-[#111827]/70 backdrop-blur-sm border border-blue-200/70 dark:border-[#1E293B] shadow-premium-sm text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">New:</span> EAA & WCAG 2.2 Ready
            <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400 ml-0.5" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="relative text-center max-w-3xl mx-auto mb-8">
          {/* Subtle radial glow behind the headline only */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[220%] pointer-events-none opacity-70 dark:opacity-40"
            style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.10), rgba(37,99,235,0) 70%)' }}
            aria-hidden="true"
          ></div>
          <h1 className="relative text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-extrabold text-slate-900 dark:text-[#E2E8F0] tracking-tight leading-[1.08]">
            Find Every Accessibility Issue on Your Website in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 dark:from-blue-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
              60 Seconds.
            </span>
          </h1>
        </div>

        {/* Main Interactive Scanner Input Container */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-[#111827] rounded-[20px] p-5 sm:p-7 shadow-premium-lg ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03] border border-slate-200 dark:border-[#1E293B] transition-colors">

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
                      className="block w-full min-h-[52px] pl-11 pr-4 py-3.5 text-slate-900 dark:text-[#E2E8F0] font-medium placeholder-slate-500 dark:placeholder-slate-500 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-50/80 dark:hover:bg-[#0B1120]/80 focus:bg-white dark:focus:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    id="hero-scan-submit-btn"
                    disabled={isScanning}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 min-h-[52px] bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 text-white font-bold rounded-xl shadow-premium-md hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-base whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 text-white font-bold rounded-xl shadow-premium-md hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Try a sample:</span>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://www.luxe-apparel.store')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                🛍️ E-Commerce
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://cloudflow-analytics.io')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                ⚡ SaaS App
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('https://metrohealth-care.org')}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                🏥 Healthcare
              </button>
              <button
                type="button"
                onClick={onExploreSample}
                className="ml-auto px-2.5 py-1 rounded-md text-blue-700 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                See a sample report <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
