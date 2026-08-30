import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Search,
  Globe2,
  Building2,
  CreditCard,
  DollarSign,
  AlertOctagon,
  FileText,
  Mail,
  Activity,
  Webhook,
  ScrollText,
  ArrowUpRight,
} from 'lucide-react';
import { OverviewTab } from './admin/tabs/OverviewTab';
import { UsersTab } from './admin/tabs/UsersTab';
import { ScansTab } from './admin/tabs/ScansTab';
import { MonitoringTab } from './admin/tabs/MonitoringTab';
import { AgenciesTab } from './admin/tabs/AgenciesTab';
import { BillingTab } from './admin/tabs/BillingTab';
import { PaymentsTab } from './admin/tabs/PaymentsTab';
import { FailedPaymentsTab } from './admin/tabs/FailedPaymentsTab';
import { ReportsTab } from './admin/tabs/ReportsTab';
import { EmailLogsTab } from './admin/tabs/EmailLogsTab';
import { SystemHealthTab } from './admin/tabs/SystemHealthTab';
import { WebhooksTab } from './admin/tabs/WebhooksTab';
import { AuditLogTab } from './admin/tabs/AuditLogTab';

interface AdminPanelProps {
  onNavigateToUserDashboard: () => void;
  onNavigateToEmails: () => void;
}

type AdminTabId =
  | 'overview' | 'users' | 'scans' | 'monitoring' | 'agencies'
  | 'billing' | 'payments' | 'failed-payments' | 'reports'
  | 'email-logs' | 'system-health' | 'webhooks' | 'audit-log';

const TABS: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'scans', label: 'Scans', icon: Search },
  { id: 'monitoring', label: 'Monitoring', icon: Globe2 },
  { id: 'agencies', label: 'Agencies', icon: Building2 },
  { id: 'billing', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'failed-payments', label: 'Failed Payments', icon: AlertOctagon },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'email-logs', label: 'Email Logs', icon: Mail },
  { id: 'system-health', label: 'System Health', icon: Activity },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'audit-log', label: 'Audit Log', icon: ScrollText },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateToUserDashboard, onNavigateToEmails }) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Top Admin Bar -- deliberately distinct from the marketing/customer UI */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            ADMIN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                AccessAudit Internal Operations Console
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-800">
                Super Admin Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Every action here is server-authorized and written to the audit log.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToEmails}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Email Templates Preview</span>
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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        {/* Tab navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'scans' && <ScansTab />}
        {activeTab === 'monitoring' && <MonitoringTab />}
        {activeTab === 'agencies' && <AgenciesTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'failed-payments' && <FailedPaymentsTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'email-logs' && <EmailLogsTab />}
        {activeTab === 'system-health' && <SystemHealthTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}
        {activeTab === 'audit-log' && <AuditLogTab />}
      </div>
    </div>
  );
};
