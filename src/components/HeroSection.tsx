import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Check, Code2 } from 'lucide-react';

interface HeroSectionProps {
  onRunScan: (targetUrl: string, htmlSnippet?: string) => void;
  onExploreSample: () => void;
  isScanning: boolean;
}

const TRUSTED_PARTNERS = [
  'OmniStudio UK',
  'Nordic Digital AS',
  'Vanguard Media',
  'Apex Growth Labs',
  'CivicWave Tech',
];

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
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 w-full bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC] dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120] transition-colors duration-200">

      {/* Background: soft color wash + a rotated, tiled logo "wallpaper" behind all content.
          Oversized (-inset-y-16, scale-110) so the rotation never exposes a corner gap;
          the section's own overflow-hidden clips it back down to the viewport. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-12 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-400/20 dark:bg-emerald-600/15 rounded-full blur-3xl"></div>

        <div className="absolute -inset-x-10 -inset-y-16 rotate-[-4deg] scale-110 flex flex-col justify-between select-none opacity-[0.07] dark:opacity-[0.05]">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className={`flex w-max items-center gap-16 whitespace-nowrap ${row % 2 === 0 ? 'marquee-track' : 'marquee-track-reverse'}`}
            >
              {[...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS].map((name, i) => (
                <span key={i} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Eyebrow Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-blue-200/80 dark:border-[#1E293B] shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">New:</span> EAA & WCAG 2.2 Ready
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-0.5" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight leading-[1.12]">
            Find Every Accessibility Issue on Your Website in{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 dark:from-blue-400 dark:via-blue-500 dark:to-emerald-400 bg-clip-text text-transparent">
              60 Seconds.
            </span>
          </h1>
        </div>

        {/* Main Interactive Scanner Input Container */}
        <div className="max-w-3xl mx-auto">
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
