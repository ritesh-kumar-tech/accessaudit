import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertOctagon, 
  Search, 
  Filter, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  FileText, 
  Download, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Mail
} from 'lucide-react';
import { UserAccount, AdminTransaction, PlanTier } from '../types';
import { sampleUserAccounts, sampleAdminTransactions } from '../data/mockAudits';

interface AdminPanelProps {
  onNavigateToUserDashboard: () => void;
  onNavigateToEmails: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onNavigateToUserDashboard,
  onNavigateToEmails,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'payments' | 'failed'>('overview');
  const [users, setUsers] = useState<UserAccount[]>(sampleUserAccounts);
  const [transactions, setTransactions] = useState<AdminTransaction[]>(sampleAdminTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForOverride, setSelectedUserForOverride] = useState<UserAccount | null>(null);

  // Override Modal state
  const [newPlan, setNewPlan] = useState<PlanTier>('agency');
  const [newStatus, setNewStatus] = useState<UserAccount['status']>('Active');
  const [overrideReason, setOverrideReason] = useState('');

  // Filtering
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const failedPayments = transactions.filter(t => t.status === 'Failed');

  // Stats
  const activeSubscribersCount = users.filter(u => u.status === 'Active' || u.status === 'Comped').length;
  const mrrTotal = users.reduce((acc, u) => {
    if (u.status !== 'Active') return acc;
    if (u.plan === 'pro') return acc + (u.billingCycle === 'annual' ? 39 : 49);
    if (u.plan === 'agency') return acc + (u.billingCycle === 'annual' ? 119 : 149);
    return acc;
  }, 0);

  const handleIssueRefund = (txId: string) => {
    const reason = window.prompt('Please enter the reason for issuing this refund (logged for compliance audit):', 'Customer requested support concession');
    if (!reason) return;

    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return {
          ...tx,
          status: 'Refunded',
          refundReason: reason
        };
      }
      return tx;
    }));
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForOverride || !overrideReason) return;

    setUsers(prev => prev.map(u => {
      if (u.id === selectedUserForOverride.id) {
        return {
          ...u,
          plan: newPlan,
          status: newStatus,
          overrideNote: `[Admin Override: ${new Date().toLocaleDateString()}] ${overrideReason}`
        };
      }
      return u;
    }));

    setSelectedUserForOverride(null);
    setOverrideReason('');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Top Admin Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            ADMIN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                AccessAudit Internal Command Console
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-800">
                Staff & Billing Oversight
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Payments, customer plan overrides, churn analytics & transactional systems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToEmails}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Email Templates</span>
          </button>
          <button
            onClick={onNavigateToUserDashboard}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Exit to User View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: TrendingUp },
            { id: 'customers', label: `Customers & Plans (${users.length})`, icon: Users },
            { id: 'payments', label: `Payments & Refunds (${transactions.length})`, icon: DollarSign },
            { id: 'failed', label: `Failed Renewals (${failedPayments.length})`, icon: AlertOctagon, badge: failedPayments.length > 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Active Subscribers</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{activeSubscribersCount}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+18% this mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Across Pro & Agency plans</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Monthly Recurring (MRR)</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">${mrrTotal.toLocaleString()}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+$320/mo net</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Normalized active subscriptions</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Monthly Churn Rate</span>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">1.4%</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Low Churn</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Industry avg: 3.5%</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>New Signups (7d)</span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">38</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">12 Paid</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">31.5% free-to-paid conversion</p>
              </div>
            </div>

            {/* Quick Actions & Recent Transactions summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Transactions Telemetry
                  </h3>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All Transactions →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{tx.customerName}</p>
                        <p className="text-[11px] text-slate-500">{tx.customerEmail} • {tx.plan}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">${tx.amount.toFixed(2)}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                          tx.status === 'Succeeded' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                          (tx.status === 'Refunded' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400')
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Admin System Health
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">WCAG 2.2 Scan Engine</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">Operational</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                    <span className="font-bold text-blue-800 dark:text-blue-300">Stripe Webhook Listeners</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100">Synchronized</span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
                    <span className="font-bold text-purple-800 dark:text-purple-300">PDF Rendering Cluster</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">Active</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors"
                  >
                    Manage Customer Overrides
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or plan..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Exporting customer CRM table to CSV...')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4">Total Scans</th>
                    <th className="py-3 px-4">Signup Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                        {user.overrideNote && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            {user.overrideNote}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] ${
                          user.plan === 'agency' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          (user.plan === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          user.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                          (user.status === 'Comped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' :
                          (user.status === 'Past Due' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-slate-100 text-slate-600'))
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-300">
                        {user.billingCycle}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {user.totalScansCount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {user.signupDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForOverride(user);
                            setNewPlan(user.plan);
                            setNewStatus(user.status);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Override Plan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Payment Transactions Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time Stripe checkout and subscription billing logs with manual refund capability.
                </p>
              </div>

              <button
                onClick={() => alert('Exporting payment records to CSV...')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080D1A] text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Tx ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Plan Item</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono">
                        <p className="font-bold text-slate-900 dark:text-white">{tx.id}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{tx.customerName}</p>
                        <p className="text-[11px] text-slate-400">{tx.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {tx.plan}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] ${
                          tx.status === 'Succeeded' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                          (tx.status === 'Refunded' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400')
                        }`}>
                          {tx.status}
                        </span>
                        {tx.refundReason && (
                          <p className="text-[9px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                            Reason: {tx.refundReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'Succeeded' && (
                          <button
                            onClick={() => handleIssueRefund(tx.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900 transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Issue Refund</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 4: FAILED PAYMENTS TAB */}
        {activeTab === 'failed' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  Failed Renewal Charges & Involuntary Churn Risk
                </h3>
                <p className="text-xs text-slate-500">
                  Customers with declining credit cards. Reach out to update payment methods before auto-cancellation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {failedPayments.map((tx) => (
                <div key={tx.id} className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{tx.customerName}</span>
                      <span className="text-xs text-red-600 font-bold uppercase font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-950">
                        {tx.plan} (${tx.amount.toFixed(2)})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Email: {tx.customerEmail} • Failed on {tx.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Triggered automated payment recovery email to ${tx.customerEmail}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Recovery Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* PLAN OVERRIDE MODAL */}
      {selectedUserForOverride && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div>
              <span className="text-[10px] uppercase font-black text-red-600 tracking-wider">
                Admin Audit Logging Enabled
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Override Plan for {selectedUserForOverride.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedUserForOverride.email}
              </p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Plan Tier</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as PlanTier)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white"
                >
                  <option value="free">Free Evaluation ($0)</option>
                  <option value="pro">Pro Compliance ($39-49/mo)</option>
                  <option value="agency">Agency White-Label ($119-149/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Comped">Comped / Complimentary</option>
                  <option value="Past Due">Past Due</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Reason Note (Mandatory for SOC2 Compliance Audit)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Approved 3-month agency trial for marketing conference speaker..."
                  required
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForOverride(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Save & Log Plan Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
