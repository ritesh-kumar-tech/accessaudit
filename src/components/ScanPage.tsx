import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckSquare,
  Clock,
  Building2,
  Volume2,
  VolumeX,
  Layers,
  Palette,
  Sliders,
  Share2,
  FileCode,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AuditResult, Category, Severity, AgencyBranding } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';
import confetti from 'canvas-confetti';

interface ScanPageProps {
  currentAudit: AuditResult;
  isScanning: boolean;
  scanProgressText: string;
  scanError?: string | null;
  onRunScan: (url: string, htmlSnippet?: string) => void;
  onOpenPdfPreview: (audit: AuditResult) => void;
  agencyBranding: AgencyBranding;
}

// Vision simulation types
type VisionFilter = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'blur' | 'inverted';

export const ScanPage: React.FC<ScanPageProps> = ({
  currentAudit,
  isScanning,
  scanProgressText,
  scanError,
  onRunScan,
  onOpenPdfPreview,
  agencyBranding,
}) => {
  const [urlInput, setUrlInput] = useState(currentAudit.url || 'https://www.luxe-apparel.store');
  const [activeTab, setActiveTab] = useState<'url' | 'code'>('url');
  const [codeSnippet, setCodeSnippet] = useState(
`<button class="bg-slate-200 text-slate-400">Submit Form</button>
<img src="/header.jpg" />
<input type="email" placeholder="Enter email" />`
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({
    'iss-1': true,
    'iss-gen-1': true
  });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedAllFixes, setCopiedAllFixes] = useState<boolean>(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Vision Simulator & Contrast Matrix State
  const [activeVisionFilter, setActiveVisionFilter] = useState<VisionFilter>('normal');
  const [activeUtilityTab, setActiveUtilityTab] = useState<'issues' | 'simulator' | 'contrast-calc' | 'screen-reader'>('issues');
  
  // Interactive Contrast Calculator State
  const [calcFgColor, setCalcFgColor] = useState<string>('#64748B');
  const [calcBgColor, setCalcBgColor] = useState<string>('#F8FAFC');
  const [calcIsLargeText, setCalcIsLargeText] = useState<boolean>(false);

  // Screen Reader Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [spokenCaption, setSpokenCaption] = useState<string>('');

  // Sync checklist items state
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    currentAudit.checklist?.forEach(item => {
      initial[item.id] = item.completed;
    });
    setChecklistState(initial);

    // Trigger celebratory confetti if score is AA or higher
    if (currentAudit.overallScore >= 80 && !isScanning) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_) {}
    }
  }, [currentAudit, isScanning]);

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url') {
      if (urlInput.trim()) {
        onRunScan(urlInput.trim());
      }
    } else {
      if (codeSnippet.trim()) {
        onRunScan('Custom Code Snippet', codeSnippet);
      }
    }
  };

  const toggleIssueExpand = (id: string) => {
    setExpandedIssueIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllIssues = () => {
    const next: Record<string, boolean> = {};
    currentAudit.issues.forEach(i => { next[i.id] = true; });
    setExpandedIssueIds(next);
  };

  const collapseAllIssues = () => {
    setExpandedIssueIds({});
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyAllRemediations = () => {
    const text = currentAudit.issues
      .filter(i => i.codeSnippetFix)
      .map((i, idx) => `/* Fix #${idx + 1}: ${i.title} (${i.wcagRule}) */\n${i.codeSnippetFix}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAllFixes(true);
    setTimeout(() => setCopiedAllFixes(false), 2500);
  };

  const handleDownloadJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAudit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wcag-audit-${currentAudit.url.replace(/https?:\/\//i, '').replace(/[^a-zA-Z0-9]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadStandardPdf = () => {
    const doc = generateAuditPdf(currentAudit);
    doc.save(`accessibility-audit-${currentAudit.url.replace(/https?:\/\//i, '').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
  };

  const handleDownloadWhiteLabelPdf = () => {
    const doc = generateAuditPdf(currentAudit, agencyBranding);
    doc.save(`${agencyBranding.agencyName.toLowerCase().replace(/\s+/g, '-')}-audit-report.pdf`);
  };

  // Math for Relative Luminance & Contrast Ratio calculation (WCAG 2.1 Formula)
  const calculateLuminance = (hex: string): number => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return 0.5;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const transform = (val: number) => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4));
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  };

  const getContrastRatio = (fg: string, bg: string): number => {
    try {
      const l1 = calculateLuminance(fg);
      const l2 = calculateLuminance(bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      const ratio = (lighter + 0.05) / (darker + 0.05);
      return Math.round(ratio * 100) / 100;
    } catch {
      return 1;
    }
  };

  const currentRatio = getContrastRatio(calcFgColor, calcBgColor);
  const aaNormalPass = currentRatio >= 4.5;
  const aaLargePass = currentRatio >= 3.0;
  const aaaNormalPass = currentRatio >= 7.0;
  const aaaLargePass = currentRatio >= 4.5;

  // Screen Reader Speech Synthesis Player
  const handleToggleScreenReader = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenCaption('');
      return;
    }

    setIsSpeaking(true);
    const announcements = [
      `Heading Level 1: Accessibility Audit for ${currentAudit.url}.`,
      `Overall compliance score: ${currentAudit.overallScore} out of 100.`,
      `Warning: Detected ${currentAudit.criticalCount} critical accessibility blockers.`,
      `Navigation Landmark: 4 navigation links found. Notice: focus outline missing on keyboard tab.`,
      `Image element: warning, missing descriptive alt text attribute.`,
      `Form region: search input field missing associated label element.`
    ];

    let step = 0;
    const speakNext = () => {
      if (step >= announcements.length) {
        setIsSpeaking(false);
        setSpokenCaption('Simulation complete. 6 accessibility landmarks announced.');
        return;
      }

      const text = announcements[step];
      setSpokenCaption(`[Screen Reader Announcing]: "${text}"`);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        step++;
        speakNext();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  // Filter issues
  const filteredIssues = currentAudit.issues.filter(issue => {
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.wcagRule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.affectedElement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  // Gauge color calculation
  const score = currentAudit.overallScore;
  const gaugeColor = score >= 80 ? '#10B981' : (score >= 60 ? '#F59E0B' : '#EF4444');
  const circumference = 2 * Math.PI * 42; // r = 42
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const categories = [
    { id: 'all', label: 'All Findings', count: currentAudit.issues.length },
    { id: 'contrast', label: 'Color Contrast', count: currentAudit.issues.filter(i => i.category === 'contrast').length },
    { id: 'images', label: 'Images & Alt Text', count: currentAudit.issues.filter(i => i.category === 'images').length },
    { id: 'keyboard', label: 'Keyboard & Focus', count: currentAudit.issues.filter(i => i.category === 'keyboard').length },
    { id: 'forms', label: 'Forms & Inputs', count: currentAudit.issues.filter(i => i.category === 'forms').length },
    { id: 'aria', label: 'ARIA & Landmarks', count: currentAudit.issues.filter(i => i.category === 'aria').length },
    { id: 'structure', label: 'Headings & Structure', count: currentAudit.issues.filter(i => i.category === 'structure').length },
  ];

  // Vision Filter CSS style mapping
  const getVisionFilterStyle = () => {
    switch (activeVisionFilter) {
      case 'protanopia':
        return { filter: 'sepia(0.6) saturate(1.8) hue-rotate(-20deg)' };
      case 'deuteranopia':
        return { filter: 'sepia(0.5) saturate(1.5) hue-rotate(45deg)' };
      case 'tritanopia':
        return { filter: 'sepia(0.7) saturate(1.4) hue-rotate(180deg)' };
      case 'achromatopsia':
        return { filter: 'grayscale(100%)' };
      case 'blur':
        return { filter: 'blur(2px)' };
      case 'inverted':
        return { filter: 'invert(100%) contrast(150%)' };
      default:
        return {};
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-[#0B1120] min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Scan Input Bar */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-[#1E293B] shadow-md shadow-slate-200/50 dark:shadow-black/40 mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-[#E2E8F0] text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Live Accessibility Diagnostics
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                WCAG 2.2 AA Matrix
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'url' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                URL Scan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'code' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                HTML Snippet
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit}>
            {activeTab === 'url' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    required
                    disabled={isScanning}
                    className="block w-full min-h-[44px] pl-11 pr-4 py-3 text-slate-900 dark:text-[#E2E8F0] font-medium bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#0B1120] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-sm whitespace-nowrap transition-all min-h-[44px]"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Website...</span>
                    </>
                  ) : (
                    <>
                      <span>Re-Run Audit</span>
                      <Zap className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste HTML or JSX code..."
                  disabled={isScanning}
                  className="w-full p-3 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl text-sm min-h-[44px]"
                  >
                    {isScanning ? 'Analyzing DOM...' : 'Scan Code Snippet'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Real Quick Scan Targets */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Quick scan a real site:</span>
            <button
              type="button"
              onClick={() => { setUrlInput('https://example.com'); onRunScan('https://example.com'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              example.com
            </button>
            <button
              type="button"
              onClick={() => { setUrlInput('https://en.wikipedia.org/wiki/Web_accessibility'); onRunScan('https://en.wikipedia.org/wiki/Web_accessibility'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Wikipedia article
            </button>
            <button
              type="button"
              onClick={() => { setUrlInput('https://www.w3.org/WAI/'); onRunScan('https://www.w3.org/WAI/'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              W3C WAI
            </button>
          </div>
        </div>

        {/* Scan Error Banner */}
        {scanError && !isScanning && (
          <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl p-5 border border-red-200 dark:border-red-900/60 shadow-sm mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-200 text-sm">Scan failed</h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{scanError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Scanning Progress Bar */}
        {isScanning && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-blue-200 dark:border-blue-900 shadow-lg mb-8 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                {scanProgressText || 'Analyzing accessibility parameters...'}
              </span>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">W3C WCAG 2.2 Test Suite</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Checking contrast ratios, ARIA landmarks, alt text, and keyboard focus...</p>
          </div>
        )}

        {/* Results Hero Overview Banner */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-xl shadow-slate-200/50 dark:shadow-black/40 mb-8 transition-colors">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">
                  {currentAudit.url}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentAudit.timestamp}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                {currentAudit.summary}
              </p>
            </div>

            {/* Export & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-preview-report"
                onClick={() => onOpenPdfPreview(currentAudit)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors min-h-[40px]"
              >
                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Preview PDF Pages</span>
              </button>

              <button
                type="button"
                id="btn-download-pdf"
                onClick={handleDownloadStandardPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-sm transition-all min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                <span>Download Client PDF</span>
              </button>

              <button
                type="button"
                id="btn-white-label-pdf"
                onClick={handleDownloadWhiteLabelPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 flex items-center gap-1.5 shadow-sm transition-all min-h-[40px]"
              >
                <Building2 className="w-4 h-4" />
                <span>Agency White-Label PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJsonReport}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Download JSON Report"
              >
                <FileCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
            
            {/* Score Circular Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-100 dark:border-[#1E293B] text-center">
              <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="9"
                    className="dark:stroke-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke={gaugeColor}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-[#E2E8F0] tracking-tight">{score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Score / 100</span>
                </div>
              </div>

              <div className="space-y-1">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: score >= 80 ? '#ECFDF5' : (score >= 60 ? '#FEF3C7' : '#FEF2F2'),
                    color: score >= 80 ? '#065F46' : (score >= 60 ? '#92400E' : '#991B1B')
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {currentAudit.grade === 'AAA' || currentAudit.grade === 'AA' ? `WCAG Level ${currentAudit.grade} Pass` : 'Remediation Required'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentAudit.scannedElementsCount} Components Checked
                </p>
              </div>
            </div>

            {/* Severity Counters & Compliance Matrix */}
            <div className="md:col-span-8 space-y-4">
              
              {/* 4 Counter Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Critical</span>
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-2xl font-black text-red-900 dark:text-red-200">{currentAudit.criticalCount}</span>
                  <span className="block text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">WCAG Level A Blockers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Moderate</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-200">{currentAudit.moderateCount}</span>
                  <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">WCAG Level AA Issues</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Minor</span>
                    <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-[#E2E8F0]">{currentAudit.minorCount}</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Advisories & Best Practice</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Passed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{currentAudit.passedCount}</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Compliant Rules</span>
                </div>
              </div>

              {/* Progress bars for diagnostic categories */}
              <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-[#1E293B] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Contrast Minimum (WCAG 1.4.3)</span>
                  <span className="font-bold text-slate-900 dark:text-[#E2E8F0]">{currentAudit.contrastPassRate}% Pass</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${currentAudit.contrastPassRate}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">ARIA & Semantic Roles (WCAG 4.1.2)</span>
                  <span className="font-bold text-slate-900 dark:text-[#E2E8F0]">{currentAudit.ariaComplianceScore}% Pass</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${currentAudit.ariaComplianceScore}%` }}></div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Diagnostic Utility Navigation Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-[#1E293B] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveUtilityTab('issues')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeUtilityTab === 'issues'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Audit Findings ({currentAudit.issues.length})</span>
          </button>

          <button
            onClick={() => setActiveUtilityTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeUtilityTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Colorblind & Vision Simulator</span>
          </button>

          <button
            onClick={() => setActiveUtilityTab('contrast-calc')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeUtilityTab === 'contrast-calc'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Contrast Ratio Matrix</span>
          </button>

          <button
            onClick={() => setActiveUtilityTab('screen-reader')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeUtilityTab === 'screen-reader'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Screen Reader Audio Simulator</span>
          </button>
        </div>

        {/* TAB 1: DETAILED FINDINGS & REMEDIATION */}
        {activeUtilityTab === 'issues' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md mb-8 transition-colors">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E293B]">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#E2E8F0]">
                  Detailed Accessibility Violations & Fixes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredIssues.length} of {currentAudit.issues.length} technical findings with code remediation.
                </p>
              </div>

              {/* Action Tools: Search & Expand/Collapse */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllRemediations}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedAllFixes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAllFixes ? 'All Fixes Copied!' : 'Copy All Code Fixes'}</span>
                </button>

                <button
                  type="button"
                  onClick={expandAllIssues}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAllIssues}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200"
                >
                  Collapse All
                </button>

                {/* Search Input */}
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search issues, rules..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1E293B] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-slate-100 dark:border-[#1E293B] no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedCategory === cat.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Issue Cards Accordion List */}
            <div className="space-y-4 pt-6">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#1E293B]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-[#E2E8F0] text-base">No Issues Match Current Filter</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All scanned components in this category meet WCAG guidelines.</p>
                </div>
              ) : (
                filteredIssues.map((issue, idx) => {
                  const isExpanded = !!expandedIssueIds[issue.id];
                  const isCritical = issue.severity === 'critical';
                  const isModerate = issue.severity === 'moderate';

                  return (
                    <div
                      key={issue.id || idx}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isCritical
                          ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20'
                          : isModerate
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827]'
                      }`}
                    >
                      {/* Header Row */}
                      <div
                        onClick={() => toggleIssueExpand(issue.id)}
                        className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isCritical ? (
                              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold text-[10px] tracking-wide uppercase">
                                CRITICAL
                              </span>
                            ) : isModerate ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] tracking-wide uppercase">
                                MODERATE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] tracking-wide uppercase">
                                MINOR
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900 dark:text-[#E2E8F0] text-sm sm:text-base">
                                {issue.title}
                              </h3>
                              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0B1120] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1E293B]">
                                {issue.wcagRule} (Level {issue.wcagLevel})
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {issue.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Fix Details */}
                      {isExpanded && (
                        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-slate-200/60 dark:border-[#1E293B] bg-white dark:bg-[#111827] space-y-4">
                          
                          {/* Affected Element Selector */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Target Element:</span>
                            <code className="px-2 py-0.5 bg-slate-100 dark:bg-[#0B1120] rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-[#1E293B]">
                              {issue.affectedElement}
                            </code>
                          </div>

                          {/* Impact & Fix Explanation */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B]">
                              <span className="font-bold text-slate-900 dark:text-[#E2E8F0] block mb-1">Why this matters:</span>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{issue.impact}</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                              <span className="font-bold text-emerald-950 dark:text-emerald-300 block mb-1">Recommended Fix:</span>
                              <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed">{issue.howToFix}</p>
                            </div>
                          </div>

                          {/* Code Comparison Snippets */}
                          {(issue.codeSnippetFaulty || issue.codeSnippetFix) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                              
                              {/* Faulty Code */}
                              {issue.codeSnippetFaulty && (
                                <div className="rounded-xl overflow-hidden border border-red-200 dark:border-red-900/60 bg-slate-950 text-slate-200">
                                  <div className="px-3 py-1.5 bg-red-950/80 border-b border-red-900 flex items-center justify-between text-[11px] font-bold text-red-200">
                                    <span>❌ Detected Faulty HTML</span>
                                  </div>
                                  <pre className="p-3 font-mono text-[11px] overflow-x-auto text-red-200/90 leading-relaxed">
                                    <code>{issue.codeSnippetFaulty}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Corrected Code Fix */}
                              {issue.codeSnippetFix && (
                                <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-900/60 bg-slate-950 text-slate-200">
                                  <div className="px-3 py-1.5 bg-emerald-950/80 border-b border-emerald-900 flex items-center justify-between text-[11px] font-bold text-emerald-200">
                                    <span>✅ Recommended Accessible Fix</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(issue.id, issue.codeSnippetFix!)}
                                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-white transition-colors"
                                    >
                                      {copiedCodeId === issue.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span>Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy Code</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-3 font-mono text-[11px] overflow-x-auto text-emerald-200/90 leading-relaxed">
                                    <code>{issue.codeSnippetFix}</code>
                                  </pre>
                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 2: COLORBLIND & ASSISTIVE VISION SIMULATOR */}
        {activeUtilityTab === 'simulator' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md mb-8 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E293B] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Colorblindness & Assistive Vision Filter Simulation
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Experience your scanned page as perceived by over 300 million people with color vision deficiencies or low vision.
                </p>
              </div>

              <div className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                Active Filter: {activeVisionFilter.toUpperCase()}
              </div>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
              {[
                { id: 'normal', name: 'Normal Vision', desc: 'Trichromacy' },
                { id: 'protanopia', name: 'Protanopia', desc: 'Red-Blind (~1%)' },
                { id: 'deuteranopia', name: 'Deuteranopia', desc: 'Green-Blind (~5%)' },
                { id: 'tritanopia', name: 'Tritanopia', desc: 'Blue-Blind (~0.1%)' },
                { id: 'achromatopsia', name: 'Monochrome', desc: 'Achromatopsia' },
                { id: 'blur', name: 'Low Acuity', desc: 'Cataracts / Blur' },
                { id: 'inverted', name: 'Inverted', desc: 'High-Contrast' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveVisionFilter(f.id as VisionFilter)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    activeVisionFilter === f.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#1E293B] hover:border-blue-400'
                  }`}
                >
                  <span className="block font-bold text-xs">{f.name}</span>
                  <span className={`block text-[10px] mt-0.5 ${activeVisionFilter === f.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Simulated Live Web Interface Viewport */}
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-900 shadow-inner">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">{currentAudit.url}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Simulation Filter Active</span>
              </div>

              {/* The Filtered Canvas */}
              <div 
                style={getVisionFilterStyle()} 
                className="p-8 sm:p-12 bg-white dark:bg-slate-900 transition-all duration-300 text-slate-900 dark:text-slate-100"
              >
                <div className="max-w-xl mx-auto space-y-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    <span>★ Premium Experience</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    Elevate Your E-Commerce Storefront
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Test how critical visual cues, discounts, and primary buttons are perceived by users with different visual spectrums.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md">
                      Primary Purchase CTA
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md">
                      20% Discount Badge
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md">
                      Urgent Stock Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: INTERACTIVE CONTRAST RATIO CALCULATOR */}
        {activeUtilityTab === 'contrast-calc' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md mb-8 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E293B] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  WCAG 2.2 Mathematical Contrast Ratio Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Test custom hex combinations against W3C WCAG 1.4.3 (AA) and 1.4.6 (AAA) luminosity standards.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const temp = calcFgColor;
                  setCalcFgColor(calcBgColor);
                  setCalcBgColor(temp);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Swap Colors</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Color Inputs */}
              <div className="lg:col-span-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Foreground */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Foreground / Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={calcFgColor}
                        onChange={(e) => setCalcFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={calcFgColor}
                        onChange={(e) => setCalcFgColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Background */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={calcBgColor}
                        onChange={(e) => setCalcBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={calcBgColor}
                        onChange={(e) => setCalcBgColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Size Switcher */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Text Size Benchmark:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcIsLargeText(false)}
                      className={`px-3 py-1 rounded-lg font-bold ${!calcIsLargeText ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      Normal Text (&lt;18pt / 24px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcIsLargeText(true)}
                      className={`px-3 py-1 rounded-lg font-bold ${calcIsLargeText ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      Large Text (≥18pt or 14pt bold)
                    </button>
                  </div>
                </div>

                {/* Score Ratio Display */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400">Measured Luminosity Ratio</span>
                    <div className="text-4xl font-black text-white mt-1">
                      {currentRatio}:1
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      (calcIsLargeText ? aaLargePass : aaNormalPass)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {(calcIsLargeText ? aaLargePass : aaNormalPass) ? '✓ WCAG AA PASS' : '✗ WCAG AA FAIL'}
                    </div>
                    <div className="block text-[11px] text-slate-400">
                      Req: {calcIsLargeText ? '3.0:1' : '4.5:1'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Preview Box & Compliance Matrix */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* Live Preview Card styled with the exact colors */}
                <div 
                  style={{ backgroundColor: calcBgColor, color: calcFgColor }}
                  className="p-8 rounded-2xl border border-slate-300 shadow-sm min-h-[160px] flex flex-col justify-center transition-colors"
                >
                  <span className={calcIsLargeText ? 'text-2xl font-bold block mb-1' : 'text-base font-bold block mb-1'}>
                    Accessible Text Readability Preview
                  </span>
                  <p className={calcIsLargeText ? 'text-lg leading-relaxed' : 'text-xs sm:text-sm leading-relaxed'}>
                    Good digital accessibility ensures text is effortless to read on both high-end retina monitors and mobile screens under direct sunlight.
                  </p>
                </div>

                {/* 4-Box Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-xl border text-center ${
                    aaNormalPass ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold">WCAG AA Normal</span>
                    <span className="text-sm font-black mt-0.5 block">{aaNormalPass ? 'PASS (≥4.5)' : 'FAIL'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    aaLargePass ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold">WCAG AA Large</span>
                    <span className="text-sm font-black mt-0.5 block">{aaLargePass ? 'PASS (≥3.0)' : 'FAIL'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    aaaNormalPass ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold">WCAG AAA Normal</span>
                    <span className="text-sm font-black mt-0.5 block">{aaaNormalPass ? 'PASS (≥7.0)' : 'FAIL'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    aaaLargePass ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold">WCAG AAA Large</span>
                    <span className="text-sm font-black mt-0.5 block">{aaaLargePass ? 'PASS (≥4.5)' : 'FAIL'}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: SCREEN READER SPEECH SIMULATOR */}
        {activeUtilityTab === 'screen-reader' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md mb-8 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E293B] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  Screen Reader (VoiceOver / NVDA) Speech Flow Simulator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Listen to how assistive technologies verbalize the audited website's headings, landmark navigation, and missing alt attributes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleScreenReader}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                  isSpeaking
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Speech Simulation</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Play Screen Reader Audio Flow</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Captions Display Box */}
            <div className="p-6 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-4 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                  {isSpeaking ? 'VOICEOVER AUDIO ACTIVE' : 'SPEECH ENGINE READY'}
                </span>
                <span className="text-slate-500 text-[10px]">W3C Accessible Name & Description Computation</span>
              </div>

              <div className="min-h-[90px] flex items-center justify-center p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
                {spokenCaption ? (
                  <span className="text-sm font-semibold text-emerald-300 leading-relaxed">
                    {spokenCaption}
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs">
                    Click "Play Screen Reader Audio Flow" above to simulate real-time assistive audio announcements.
                  </span>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Developer Remediation Checklist Interactive Block */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E293B] shadow-md mb-12 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#E2E8F0]">
                  Developer Remediation Checklist
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prioritized engineering checklist with time estimates to reach 100% WCAG 2.2 AA conformance.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              {Object.values(checklistState).filter(Boolean).length} of {currentAudit.checklist?.length || 0} tasks marked resolved
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
            {currentAudit.checklist?.map((item) => {
              const isChecked = !!checklistState[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className={`text-xs sm:text-sm font-semibold transition-all ${
                        isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-[#E2E8F0]'
                      }`}>
                        {item.task}
                      </span>
                      <span className="ml-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        WCAG {item.wcagRule}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ~{item.estimatedMinutes}m
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Download CTA */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl">
            <div>
              <span className="font-bold text-slate-900 dark:text-[#E2E8F0] text-sm block">Export Client-Ready Audit Package</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Includes executive cover, severity breakdown, code fixes, and checklist.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadStandardPdf}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
