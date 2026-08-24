import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Building2
} from 'lucide-react';
import { EmailTemplatePreview } from '../types';
import { sampleEmailTemplates } from '../data/mockAudits';

interface EmailSystemViewerProps {
  onBack: () => void;
}

export const EmailSystemViewer: React.FC<EmailSystemViewerProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(sampleEmailTemplates[0].id);

  const filteredTemplates = sampleEmailTemplates.filter(t => 
    activeFilter === 'all' ? true : t.target === activeFilter
  );

  const selectedTemplate = sampleEmailTemplates.find(t => t.id === selectedTemplateId) || sampleEmailTemplates[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 dark:text-white">
              Transactional & Admin Email Hub
            </h1>
            <p className="text-xs text-slate-500">
              Live HTML/Text email previews adhering to anti-slop typography and brand colors
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors"
        >
          Return to App
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Notifications ({sampleEmailTemplates.length})
            </button>
            <button
              onClick={() => setActiveFilter('user')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'user' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              User Emails (7)
            </button>
            <button
              onClick={() => setActiveFilter('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'admin' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Admin Alerts (3)
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Standard compliance footer & single CTA pattern enforced
          </span>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Template List */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTemplateId === template.id
                    ? 'bg-white dark:bg-[#111827] border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-white/70 dark:bg-[#111827]/70 border-slate-200 dark:border-slate-800 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                    template.target === 'admin'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                  }`}>
                    {template.target.toUpperCase()} EMAIL
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">HTML Template</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  Trigger: {template.trigger}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Live Email Simulator */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            
            {/* Browser/Email Client Chrome */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">From:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">AccessAudit System &lt;notifications@accessaudit.io&gt;</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">To:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedTemplate.target === 'admin' ? 'admin-ops@accessaudit.io' : 'alex.rivera@vanguarddigital.io'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Subject:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTemplate.subject}</span>
              </div>
            </div>

            {/* Email Body Canvas */}
            <div className="p-8 sm:p-10 bg-slate-50 dark:bg-[#0B1120] flex justify-center">
              <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                
                {/* Brand Header */}
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                    Access<span className="text-blue-600">Audit</span>
                  </span>
                </div>

                {/* Email Title */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedTemplate.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Content paragraphs */}
                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {selectedTemplate.bodyPreview.map((line, idx) => (
                    <p key={idx} className={line.startsWith('•') ? 'pl-2 text-slate-800 dark:text-slate-200 font-medium' : ''}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Primary CTA Button */}
                {selectedTemplate.ctaText && (
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                    >
                      <span>{selectedTemplate.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Compliance Footer */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-1.5">
                  <p>
                    You are receiving this automated transactional notification regarding your AccessAudit account.
                  </p>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>© 2026 AccessAudit Inc. • W3C WCAG 2.2 Standards</span>
                    <span className="underline cursor-pointer">Manage Email Preferences</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
