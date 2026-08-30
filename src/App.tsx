/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { PageView, AuditResult, AgencyBranding, UserAccount, PlanTier } from './types';
import { sampleAudits } from './data/mockAudits';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustBar } from './components/TrustBar';
import { ProblemSection } from './components/ProblemSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { PricingSection } from './components/PricingSection';
import { AgencySection } from './components/AgencySection';
import { ScanPage } from './components/ScanPage';
import { DashboardPage } from './components/DashboardPage';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';
import { EmailSystemViewer } from './components/EmailSystemViewer';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { Footer } from './components/Footer';

async function loadUserAccount(session: Session): Promise<UserAccount> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, plan, billing_cycle, created_at')
    .eq('id', session.user.id)
    .single();

  return {
    id: session.user.id,
    name: profile?.full_name || session.user.email || 'Account',
    email: session.user.email || '',
    role: (profile?.role as 'user' | 'admin') || 'user',
    plan: (profile?.plan as PlanTier) || 'free',
    billingCycle: (profile?.billing_cycle as 'monthly' | 'annual') || 'monthly',
    // Billing isn't wired up yet -- these fields are placeholders until Stripe is integrated.
    status: 'Active',
    currentPeriodEnd: 'N/A',
    cancelAtPeriodEnd: false,
    cardLast4: 'None',
    cardBrand: 'N/A',
    signupDate: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : '',
    totalScansCount: 0,
  };
}

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditResult>(sampleAudits['example-ecommerce.com']);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgressText, setScanProgressText] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedAuditForPreview, setSelectedAuditForPreview] = useState<AuditResult | null>(null);

  // Authenticated User State (backed by Supabase Auth + the `profiles` table)
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [initialAuthPlan, setInitialAuthPlan] = useState<PlanTier>('free');
  const isLoggedIn = Boolean(session);

  // Theme state: dark / light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessaudit_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('accessaudit_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Agency branding state (still local-only; agency workspace persistence lands in a later batch)
  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding>({
    agencyName: 'Vanguard Digital Agency',
    logoUrl: '',
    primaryColor: '#2563EB',
    accentColor: '#10B981',
    tagline: 'Accessibility & High-Performance Web Engineering',
    contactEmail: 'audits@vanguarddigital.io',
    website: 'https://vanguarddigital.io',
    enabled: true,
    disclaimer: 'This audit report is generated using automated WCAG 2.2 testing and does not constitute legal advice or a guarantee of compliance.',
  });

  // Bootstrap + subscribe to the real Supabase auth session.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Whenever the session changes, load (or clear) the corresponding profile.
  useEffect(() => {
    if (!session) {
      setCurrentUser(null);
      return;
    }
    loadUserAccount(session).then(setCurrentUser);
  }, [session]);

  // Protected routes: bounce unauthenticated visitors away from account-only views,
  // and non-admins away from the admin console. Enforced here, not just by hiding links.
  useEffect(() => {
    if (authLoading) return;
    if ((currentView === 'dashboard') && !isLoggedIn) {
      setCurrentView('auth');
    }
    if (currentView === 'admin' && currentUser?.role !== 'admin') {
      setCurrentView('landing');
    }
  }, [currentView, isLoggedIn, authLoading, currentUser]);

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunScan = async (targetUrl: string, htmlSnippet?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanProgressText('Launching headless browser and loading target page...');
    setCurrentView('scan');

    const progressSteps = [
      'Scanning DOM nodes and responsive layout hierarchy...',
      'Computing text color contrast ratios (WCAG 1.4.3)...',
      'Evaluating alternative text and ARIA landmark roles...',
      'Testing keyboard focus navigation and focus traps...',
      'Synthesizing WCAG 2.2 issue summary...',
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setScanProgressText(progressSteps[stepIndex]);
        stepIndex++;
      }
    }, 450);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: targetUrl, htmlSnippet }),
      });

      const result = await response.json();

      if (response.ok && result && result.overallScore !== undefined) {
        setCurrentAudit(result);
      } else {
        setScanError(result?.error || 'The scan failed. Please check the URL and try again.');
      }
    } catch (err) {
      console.error('Scan request failed', err);
      setScanError('Could not reach the scan service. Please try again in a moment.');
    } finally {
      clearInterval(progressInterval);
      setIsScanning(false);
      setScanProgressText('');
    }
  };

  const handleSelectPlan = (planName: string) => {
    let tier: PlanTier = 'pro';
    if (planName.toLowerCase().includes('agency')) tier = 'agency';
    if (planName.toLowerCase().includes('free') || planName.toLowerCase().includes('eval')) tier = 'free';

    setInitialAuthPlan(tier);
    if (!isLoggedIn) {
      handleNavigate('auth');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleAuthSuccess = (_updatedFields: Partial<UserAccount>) => {
    // The real user record is derived from the Supabase session via loadUserAccount();
    // this just moves the user into the app once sign-in/sign-up has completed.
    handleNavigate('dashboard');
  };

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSession(null);
    handleNavigate('landing');
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#E2E8F0] font-sans flex flex-col selection:bg-blue-500/20 selection:text-blue-600 transition-colors duration-200">

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onScanClick={() => handleNavigate('scan')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onToggleAuth={() => handleNavigate('auth')}
        onLogout={handleLogout}
      />

      {/* Main Content Area based on current view */}
      <main className="flex-1">

        {/* LANDING PAGE VIEW */}
        {currentView === 'landing' && (
          <div className="animate-in fade-in duration-300">
            <HeroSection
              onRunScan={handleRunScan}
              onOpenPdfPreview={setSelectedAuditForPreview}
              sampleAudit={currentAudit}
              isScanning={isScanning}
              agencyBranding={agencyBranding}
            />
            <TrustBar />
            <ProblemSection onScanClick={() => handleNavigate('scan')} />
            <FeaturesSection
              onScanClick={() => handleNavigate('scan')}
              onAgencyClick={() => handleNavigate('agency')}
            />
            <HowItWorks onScanClick={() => handleNavigate('scan')} />
            <PricingSection
              onSelectPlan={handleSelectPlan}
              onScanClick={() => handleNavigate('scan')}
            />
            <AgencySection
              agencyBranding={agencyBranding}
              onUpdateBranding={setAgencyBranding}
              onSelectPlan={handleSelectPlan}
              onOpenPdfPreview={setSelectedAuditForPreview}
            />
          </div>
        )}

        {/* LIVE SCAN / DEMO PAGE VIEW */}
        {currentView === 'scan' && (
          <div className="animate-in fade-in duration-300">
            <ScanPage
              currentAudit={currentAudit}
              isScanning={isScanning}
              scanProgressText={scanProgressText}
              scanError={scanError}
              onRunScan={handleRunScan}
              onOpenPdfPreview={setSelectedAuditForPreview}
              agencyBranding={agencyBranding}
            />
          </div>
        )}

        {/* PRICING PAGE VIEW */}
        {currentView === 'pricing' && (
          <div className="animate-in fade-in duration-300">
            <PricingSection
              onSelectPlan={handleSelectPlan}
              onScanClick={() => handleNavigate('scan')}
            />
          </div>
        )}

        {/* AGENCY WHITE-LABEL PAGE VIEW */}
        {currentView === 'agency' && (
          <div className="animate-in fade-in duration-300">
            <AgencySection
              agencyBranding={agencyBranding}
              onUpdateBranding={setAgencyBranding}
              onSelectPlan={handleSelectPlan}
              onOpenPdfPreview={setSelectedAuditForPreview}
            />
          </div>
        )}

        {/* DASHBOARD PAGE VIEW */}
        {currentView === 'dashboard' && currentUser && (
          <div className="animate-in fade-in duration-300">
            <DashboardPage
              onRunScan={handleRunScan}
              onNavigateToScan={() => handleNavigate('scan')}
              onOpenPdfPreview={setSelectedAuditForPreview}
              agencyBranding={agencyBranding}
              currentUser={currentUser}
              onUpdateUser={(partial) => setCurrentUser(prev => (prev ? { ...prev, ...partial } : prev))}
              onNavigateToPricing={() => handleNavigate('pricing')}
            />
          </div>
        )}

        {/* AUTH PAGE VIEW */}
        {currentView === 'auth' && (
          <div className="animate-in fade-in duration-300">
            <AuthPage
              initialPlan={initialAuthPlan}
              onSuccess={handleAuthSuccess}
              onBackHome={() => handleNavigate('landing')}
            />
          </div>
        )}

        {/* ADMIN PANEL VIEW (guarded above: only rendered once currentUser.role === 'admin') */}
        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <AdminPanel
              onNavigateToUserDashboard={() => handleNavigate('dashboard')}
              onNavigateToEmails={() => handleNavigate('emails')}
            />
          </div>
        )}

        {/* EMAIL SYSTEM PREVIEW HUB */}
        {currentView === 'emails' && (
          <div className="animate-in fade-in duration-300">
            <EmailSystemViewer
              onBack={() => handleNavigate('dashboard')}
            />
          </div>
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onScanClick={() => handleNavigate('scan')}
        isAdmin={currentUser?.role === 'admin'}
      />

      {/* Multi-Page PDF Preview Inspector Modal */}
      {selectedAuditForPreview && (
        <PdfPreviewModal
          audit={selectedAuditForPreview}
          agencyBranding={agencyBranding}
          userPlan={currentUser?.plan || 'free'}
          onClose={() => setSelectedAuditForPreview(null)}
          onUpgrade={() => {
            handleNavigate(isLoggedIn ? 'dashboard' : 'auth');
          }}
        />
      )}

    </div>
  );
}
