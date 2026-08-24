/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, AuditResult, AgencyBranding, UserAccount, PlanTier } from './types';
import { sampleAudits, sampleUserAccounts } from './data/mockAudits';
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

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditResult>(sampleAudits['example-ecommerce.com']);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgressText, setScanProgressText] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedAuditForPreview, setSelectedAuditForPreview] = useState<AuditResult | null>(null);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<UserAccount>(sampleUserAccounts[0]); // Alex Rivera by default
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [initialAuthPlan, setInitialAuthPlan] = useState<PlanTier>('pro');

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

  // Agency branding state
  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding>({
    agencyName: 'Vanguard Digital Agency',
    logoUrl: '',
    primaryColor: '#2563EB',
    tagline: 'Accessibility & High-Performance Web Engineering',
    contactEmail: 'audits@vanguarddigital.io',
    website: 'https://vanguarddigital.io',
    enabled: true,
  });

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunScan = async (targetUrl: string, htmlSnippet?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanProgressText('Launching headless browser and loading target page...');

    // Switch to scan view
    setCurrentView('scan');

    const progressSteps = [
      'Scanning DOM nodes and responsive layout hierarchy...',
      'Computing 4.5:1 text color contrast ratios (WCAG 1.4.3)...',
      'Evaluating alternative text and ARIA landmark roles...',
      'Testing keyboard focus navigation and focus traps...',
      'Synthesizing WCAG 2.2 Level AA / AAA compliance matrix...'
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setScanProgressText(progressSteps[stepIndex]);
        stepIndex++;
      }
    }, 450);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, htmlSnippet })
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
    if (tier === 'agency') {
      handleNavigate('agency');
    } else if (!isLoggedIn) {
      handleNavigate('auth');
    } else {
      setCurrentUser(prev => ({ ...prev, plan: tier }));
      handleNavigate('dashboard');
    }
  };

  const handleAuthSuccess = (updatedFields: Partial<UserAccount>) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedFields
    }));
    setIsLoggedIn(true);
    handleNavigate('dashboard');
  };

  const handleUpdateCurrentUser = (partial: Partial<UserAccount>) => {
    setCurrentUser(prev => ({ ...prev, ...partial }));
  };

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
        onToggleAuth={() => handleNavigate('auth')}
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
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <DashboardPage
              onRunScan={handleRunScan}
              onOpenPdfPreview={setSelectedAuditForPreview}
              agencyBranding={agencyBranding}
              currentUser={currentUser}
              onUpdateUser={handleUpdateCurrentUser}
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

        {/* ADMIN PANEL VIEW */}
        {currentView === 'admin' && (
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
      />

      {/* Multi-Page PDF Preview Inspector Modal */}
      {selectedAuditForPreview && (
        <PdfPreviewModal
          audit={selectedAuditForPreview}
          agencyBranding={agencyBranding}
          userPlan={currentUser.plan}
          onClose={() => setSelectedAuditForPreview(null)}
          onUpgrade={(tier) => {
            setCurrentUser(prev => ({ ...prev, plan: tier }));
            handleNavigate('dashboard');
          }}
        />
      )}

    </div>
  );
}
