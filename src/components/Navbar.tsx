import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Building2,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { PageView, UserAccount } from '../types';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onScanClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isLoggedIn?: boolean;
  currentUser?: UserAccount | null;
  onToggleAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onScanClick,
  theme,
  onToggleTheme,
  isLoggedIn = false,
  currentUser = null,
  onToggleAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            id="nav-brand-logo"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-[#E2E8F0] font-sans">
                  Access<span className="text-blue-600">Audit</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  WCAG 2.2
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Automated Compliance & PDF Reports</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-link-home"
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'landing' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              Overview
            </button>
            <button
              id="nav-link-scan"
              onClick={() => handleNav('scan')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'scan' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              Live Scan
            </button>
            <button
              id="nav-link-agency"
              onClick={() => handleNav('agency')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'agency' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              For Agencies
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                White-Label
              </span>
            </button>
            <button
              id="nav-link-pricing"
              onClick={() => handleNav('pricing')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'pricing' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              Pricing
            </button>
            <button
              id="nav-link-dashboard"
              onClick={() => handleNav('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </nav>

          {/* Action CTAs & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-[#1E293B] transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Desktop Auth Button */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-1">
                <button
                  id="nav-btn-account"
                  onClick={() => handleNav('dashboard')}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors max-w-[160px] truncate"
                  title={currentUser?.email}
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser?.name || 'Account'}</span>
                </button>
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-auth"
                onClick={() => (onToggleAuth ? onToggleAuth() : handleNav('auth'))}
                className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Primary CTA - Visible on ALL screen sizes (Mobile + Desktop) */}
            <button
              id="nav-btn-scan-cta"
              onClick={onScanClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm transition-all shrink-0 min-h-[40px]"
            >
              <span>Get Free Scan</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1E293B] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#1E293B] shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1.5">
            <button
              onClick={() => handleNav('landing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentView === 'landing'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Overview</span>
              <span className="text-xs text-slate-400">Home</span>
            </button>

            <button
              onClick={() => handleNav('scan')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentView === 'scan'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Live URL Scan</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                Instant
              </span>
            </button>

            <button
              onClick={() => handleNav('agency')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentView === 'agency'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>For Agencies</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                White-Label
              </span>
            </button>

            <button
              onClick={() => handleNav('pricing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentView === 'pricing'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Pricing & Plans</span>
              <span className="text-xs text-slate-400 font-normal">From $0</span>
            </button>

            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Client Dashboard</span>
              </div>
              <span className="text-xs text-slate-400 font-normal">Monitoring</span>
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] space-y-2">
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    handleNav('dashboard');
                  } else if (onToggleAuth) {
                    onToggleAuth();
                  } else {
                    handleNav('auth');
                  }
                }}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-bold text-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Sign In / Register'}
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl text-sm font-bold text-center bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
