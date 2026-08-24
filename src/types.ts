export type Severity = 'critical' | 'moderate' | 'minor' | 'passed';

export type Category = 
  | 'contrast'
  | 'images'
  | 'keyboard'
  | 'forms'
  | 'structure'
  | 'aria';

export interface AuditIssue {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  plainSummary?: string; // Non-technical plain language explanation
  wcagRule: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  affectedElement: string;
  codeSnippetFaulty?: string;
  codeSnippetFix?: string;
  impact: string;
  howToFix: string;
}

export interface DeveloperChecklistItem {
  id: string;
  task: string;
  wcagRule: string;
  severity: Severity;
  completed: boolean;
  estimatedMinutes: number;
}

export interface AuditResult {
  id: string;
  url: string;
  timestamp: string;
  overallScore: number;
  grade: 'A' | 'AA' | 'AAA' | 'Needs Remediation';
  status: 'passed' | 'warning' | 'failed';
  summary: string;
  plainExecutiveSummary?: string; // Executive summary tailored for business owners
  topPriorityFixes?: string[]; // Top 3 priority fixes for executives
  criticalCount: number;
  moderateCount: number;
  minorCount: number;
  passedCount: number;
  issues: AuditIssue[];
  checklist: DeveloperChecklistItem[];
  scannedElementsCount: number;
  contrastPassRate: number;
  ariaComplianceScore: number;
  keyboardNavigableScore: number;
  legalRiskLevel: 'High' | 'Moderate' | 'Low';
}

export type PlanTier = 'free' | 'pro' | 'agency';

export interface AgencyBranding {
  enabled: boolean;
  agencyName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  website: string;
  logoUrl: string;
  disclaimer: string;
}

export interface MonitoredSite {
  id: string;
  url: string;
  name: string;
  lastScanned: string;
  score: number;
  previousScore: number;
  status: 'improved' | 'declined' | 'stable';
  criticalIssues: number;
  monitoringInterval: 'daily' | 'weekly' | 'monthly';
  notificationsEnabled: boolean;
  scoreHistory: { date: string; score: number }[];
}

export interface PricingTier {
  id: string;
  name: string;
  tier: PlanTier;
  badge?: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  ctaText: string;
  popular?: boolean;
  isAgency?: boolean;
}

export type PageView = 
  | 'landing'
  | 'scan'
  | 'pricing'
  | 'agency'
  | 'auth'
  | 'dashboard'
  | 'admin'
  | 'emails';

export type ActivePage = PageView;

// User & Billing Types
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: PlanTier;
  billingCycle: 'monthly' | 'annual';
  status: 'Active' | 'Cancelled' | 'Past Due' | 'Comped';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cardLast4: string;
  cardBrand: string;
  signupDate: string;
  totalScansCount: number;
  overrideNote?: string;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  planName: string;
  status: 'Paid' | 'Failed' | 'Refunded';
  pdfDownloadUrl: string;
}

export interface AdminTransaction {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  plan: string;
  status: 'Succeeded' | 'Failed' | 'Refunded';
  refundReason?: string;
}

export interface EmailTemplatePreview {
  id: string;
  target: 'user' | 'admin';
  title: string;
  subject: string;
  description: string;
  trigger: string;
  ctaText?: string;
  bodyPreview: string[];
}
