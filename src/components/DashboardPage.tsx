import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Globe2, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Settings,
  CreditCard,
  Building2,
  Calendar,
  Zap,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Lock,
  Mail,
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { MonitoredSite, AuditResult, AgencyBranding, UserAccount, BillingInvoice, PlanTier } from '../types';
import { sampleMonitoredSites, sampleAudits, sampleBillingInvoices, samplePricingTiers } from '../data/mockAudits';
import { generateAuditPdf } from '../services/pdfGenerator';

interface DashboardPageProps {
  onRunScan: (url: string) => void;
  onOpenPdfPreview: (audit: AuditResult) => void;
  agencyBranding: AgencyBranding;
  currentUser: UserAccount;
  onUpdateUser: (user: Partial<UserAccount>) => void;
  onNavigateToPricing: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onRunScan,
  onOpenPdfPreview,
  agencyBranding,
  currentUser,
  onUpdateUser,
  onNavigateToPricing,
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'billing' | 'branding'>('monitoring');
  const [sites, setSites] = useState<MonitoredSite[]>(sampleMonitoredSites);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sampleMonitoredSites[0].id);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteName, setNewSiteName] = useState('');

  // Billing Management State
  const [invoices, setInvoices] = useState<BillingInvoice[]>(sampleBillingInvoices);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateCardModal, setShowUpdateCardModal] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<'confirm' | 'discountOffer' | 'done'>('confirm');
  const [newCardLast4, setNewCardLast4] = useState('8831');
  const [newCardExpiry, setNewCardExpiry] = useState('08/29');

  const selectedSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl) return;

    const newSite: MonitoredSite = {
      id: `site-${Date.now()}`,
      url: newSiteUrl.startsWith('http') ? newSiteUrl : `https://${newSiteUrl}`,
      name: newSiteName || newSiteUrl.replace(/https?:\/\//i, ''),
      lastScanned: 'Just now',
      score: 72,
      previousScore: 68,
      status: 'improved',
      criticalIssues: 2,
      monitoringInterval: 'weekly',
      notificationsEnabled: true,
      scoreHistory: [
        { date: 'Aug 01', score: 65 },
        { date: 'Aug 10', score: 68 },
        { date: 'Aug 24', score: 72 },
      ]
    };

    setSites([newSite, ...sites]);
    setSelectedSiteId(newSite.id);
    setNewSiteUrl('');
    setNewSiteName('');
    setShowAddSiteModal(false);
  };

  const handleDownloadSitePdf = (site: MonitoredSite) => {
    const mockAudit = sampleAudits['example-ecommerce.com'];
    const customAudit: AuditResult = {
      ...mockAudit,
      url: site.url,
      overallScore: site.score,
      criticalCount: site.criticalIssues,
    };
    const doc = generateAuditPdf(customAudit, agencyBranding, currentUser.plan);
    doc.save(`${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-accessibility-report.pdf`);
  };

  // Subscription helpers
  const handleConfirmCancel = () => {
    onUpdateUser({
      cancelAtPeriodEnd: true,
      status: 'Cancelled'
    });
    setCancelStep('done');
  };

  const handleAcceptDiscount = () => {
    alert('50% Retention Discount Applied for the next 3 billing months!');
    setShowCancelModal(false);
    setCancelStep('confirm');
  };

  const handleReactivate = () => {
    onUpdateUser({
      cancelAtPeriodEnd: false,
      status: 'Active'
    });
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      cardLast4: newCardLast4,
      cardBrand: 'Visa'
    });
    setShowUpdateCardModal(false);
  };

  const handleChangePlan = (targetPlan: PlanTier) => {
    onUpdateUser({
      plan: targetPlan,
      cancelAtPeriodEnd: false,
      status: 'Active'
    });
    setShowPlanChangeModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors">
      
      {/* Top Banner if Subscription is scheduled for cancellation */}
      {currentUser.cancelAtPeriodEnd && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Your plan will end on <strong>{currentUser.currentPeriodEnd}</strong>. You maintain full access to all features until then.
            </span>
          </div>
          <button
            onClick={handleReactivate}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-extrabold hover:bg-slate-800 transition-colors"
          >
            Reactivate Subscription
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Welcome & Navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Accessibility Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {currentUser.plan.toUpperCase()} PLAN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          {/* Quick Sub-navigation */}
          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'monitoring'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'billing'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Plan</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CONTINUOUS MONITORING */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Monitored Websites</span>
                  <Globe2 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{sites.length}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Scheduled</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Automated weekly deep scans</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Average Score</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {Math.round(sites.reduce((acc, s) => acc + s.score, 0) / sites.length)}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">+6.4% vs last month</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Active Critical Blockers</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-red-600">
                    {sites.reduce((acc, s) => acc + s.criticalIssues, 0)}
                  </span>
                  <span className="text-xs font-bold text-amber-500">Requires Fixes</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Buttons, alt tags, keyboard traps</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>ADA Legal Safety</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">85%</span>
                  <span className="text-xs font-bold text-emerald-600">Low Exposure</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">WCAG 2.2 AA Conformance</p>
              </div>
            </div>

            {/* Monitored Sites Table & Add Modal Button */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Client Domains Portfolio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Continuous health tracking and one-click PDF generation
                  </p>
                </div>

                <button
                  onClick={() => setShowAddSiteModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Site</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Domain & Name</th>
                      <th className="py-3 px-4">WCAG Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Critical Issues</th>
                      <th className="py-3 px-4">Interval</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{site.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{site.url}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{site.score}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            site.status === 'improved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                            (site.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')
                          }`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${site.criticalIssues > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {site.criticalIssues} critical
                          </span>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-500">
                          {site.monitoringInterval}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onRunScan(site.url)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Re-scan</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSitePdf(site)}
                              className="px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <Download className="w-3 h-3" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BILLING & SUBSCRIPTION MANAGEMENT (USER-SIDE) */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            
            {/* Current Plan Overview Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Current Active Subscription
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {currentUser.plan === 'free' ? 'Free Evaluation Plan' : (currentUser.plan === 'pro' ? 'Pro Compliance Plan' : 'Agency White-Label Plan')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {currentUser.plan === 'free'
                    ? 'Includes executive summary cards and instant scans. Upgrade to unlock full code fixes.'
                    : `Your plan automatically renews on ${currentUser.currentPeriodEnd} at $${currentUser.plan === 'pro' ? '39' : '119'}/month.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowPlanChangeModal(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Change Plan / Upgrade</span>
                </button>

                {currentUser.plan !== 'free' && !currentUser.cancelAtPeriodEnd && (
                  <button
                    onClick={() => {
                      setCancelStep('confirm');
                      setShowCancelModal(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method & Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Payment Method Card */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Payment Method on File</span>
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                      {currentUser.cardBrand.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">•••• •••• •••• {currentUser.cardLast4}</p>
                      <p className="text-[10px] text-slate-400">Default renewal method</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUpdateCardModal(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Update Card
                  </button>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Payments are encrypted and secured via Stripe.</p>
                  <p>• Invoices include VAT/Tax breakdown for corporate accounting.</p>
                </div>
              </div>

              {/* Billing History Table */}
              <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Billing & Invoice History</span>
                  <span className="text-xs font-normal text-slate-400">All Tax Invoices (PDF)</span>
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{inv.planName}</p>
                        <p className="text-[11px] text-slate-400">{inv.date} • {inv.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 dark:text-white">${inv.amount.toFixed(2)}</span>
                        <span className="px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                          {inv.status}
                        </span>
                        <button
                          onClick={() => alert(`Downloading Invoice PDF: ${inv.id}`)}
                          className="p-1 text-slate-500 hover:text-blue-600"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL: CANCEL SUBSCRIPTION FLOW */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            
            {cancelStep === 'confirm' && (
              <>
                <div>
                  <span className="text-[10px] uppercase font-black text-red-600 tracking-wider">
                    Subscription Cancellation
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    Are you sure you want to cancel?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    If you cancel, you will maintain access until <strong>{currentUser.currentPeriodEnd}</strong>. After this date, you will lose:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mt-2 list-disc pl-4">
                    <li>Automated daily/weekly continuous regression scans</li>
                    <li>White-label PDF exports with your custom agency branding</li>
                    <li>Interactive developer checklists and ready-to-copy code fixes</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200">
                      Stay with 50% Off For 3 Months?
                    </h4>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Keep your active monitoring at half price.
                    </p>
                  </div>
                  <button
                    onClick={handleAcceptDiscount}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
                  >
                    Claim 50% Off
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Keep My Subscription
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </>
            )}

            {cancelStep === 'done' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Subscription Cancelled
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your plan will remain active until <strong>{currentUser.currentPeriodEnd}</strong>. You can reactivate anytime with one click.
                </p>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: UPDATE PAYMENT CARD */}
      {showUpdateCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Update Payment Method
              </h3>
              <p className="text-xs text-slate-500">
                Enter your updated credit or debit card for future renewal charges.
              </p>
            </div>

            <form onSubmit={handleUpdateCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="•••• •••• •••• 8831"
                  required
                  onChange={(e) => setNewCardLast4(e.target.value.slice(-4) || '8831')}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expires (MM/YY)</label>
                  <input
                    type="text"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    required
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                  <input
                    type="text"
                    placeholder="•••"
                    required
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PLAN / UPGRADE */}
      {showPlanChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-w-2xl w-full space-y-5">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Upgrade or Change Subscription Plan
              </h3>
              <p className="text-xs text-slate-500">
                Prorated immediately on your current billing cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {samplePricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    currentUser.plan === tier.tier
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080D1A]'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tier.name}</h4>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                      ${tier.priceAnnual}<span className="text-xs font-normal text-slate-400">/mo</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{tier.description}</p>
                  </div>

                  <div className="pt-4">
                    {currentUser.plan === tier.tier ? (
                      <span className="block text-center py-2 rounded-xl text-xs font-bold bg-blue-600 text-white">
                        Current Plan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleChangePlan(tier.tier)}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-blue-600 transition-colors"
                      >
                        Switch to {tier.name}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPlanChangeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MONITORED SITE */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-[#1E293B] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#E2E8F0]">Add Monitored Website</h3>
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target URL</label>
                <input
                  type="url"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  placeholder="https://clientwebsite.com"
                  required
                  className="w-full min-h-[44px] p-2.5 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name / Client</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g. Acme Corp E-commerce"
                  className="w-full min-h-[44px] p-2.5 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 min-h-[44px]"
                >
                  Start Monitoring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
