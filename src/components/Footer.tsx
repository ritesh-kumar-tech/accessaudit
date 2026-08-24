import React from 'react';
import { ShieldCheck, Heart, ArrowUp, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
  onScanClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onScanClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1120] text-slate-300 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('landing')} 
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Access<span className="text-blue-500">Audit</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              The automated web accessibility & WCAG 2.2 audit platform built for digital agencies, developers, and compliance officers.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>W3C WCAG 2.2 AA & ADA Title III Verified</span>
              </div>
            </div>
          </div>

          {/* Col 1: Product */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Audit Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={onScanClick} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Free URL Scanner
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('agency')} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  White-Label PDF Reports
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('dashboard')} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Continuous Monitoring
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('pricing')} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Agency Pricing Plans
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  CI/CD GitHub Action (Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 2: Compliance & Standards */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Standards & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="hover:text-white transition-colors">
                European Accessibility Act (EAA)
              </li>
              <li className="hover:text-white transition-colors">
                W3C WCAG 2.2 Guidelines
              </li>
              <li className="hover:text-white transition-colors">
                US ADA Title III Requirements
              </li>
              <li className="hover:text-white transition-colors">
                Section 508 Rehabilitation Act
              </li>
              <li className="hover:text-white transition-colors">
                Color Contrast Standard (1.4.3)
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Trust & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('auth')} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Client Portal Sign In
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admin')} 
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Admin Console</span>
                  <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">STAFF</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('emails')} 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Transactional Email Previews
                </button>
              </li>
              <li className="text-slate-300">
                Email: support@accessaudit.io
              </li>
              <li className="text-slate-300">
                London • New York • Berlin
              </li>
              <li className="text-emerald-400 font-semibold">
                99.9% Uptime SLA
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & Accessibility commitment */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} AccessAudit SaaS. All rights reserved.</span>
            <span>•</span>
            <span>Designed for 100% WCAG AA Accessibility.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
