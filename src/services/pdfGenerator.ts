// Named import (not default) is required for this to work both in the browser
// (Vite bundles jspdf's ES build) and under plain Node (tsx resolves jspdf's
// CJS build for server-side report generation) -- the two builds only agree
// on the named `jsPDF` export, not on what a default import resolves to.
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { AuditResult, AgencyBranding, PlanTier } from '../types';

export function generateAuditPdf(
  audit: AuditResult, 
  agencyBranding?: AgencyBranding,
  planTier: PlanTier = 'agency'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isAgency = (planTier === 'agency') && agencyBranding && agencyBranding.enabled;
  const brandName = isAgency ? agencyBranding.agencyName : 'AccessAudit';
  const primaryColorHex = isAgency ? (agencyBranding.primaryColor || '#2563EB') : '#2563EB';
  const contactEmail = isAgency ? agencyBranding.contactEmail : 'compliance@accessaudit.io';
  const websiteUrl = isAgency ? agencyBranding.website : 'https://accessaudit.io';

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const primaryRgb = hexToRgb(primaryColorHex);
  const darkRgb: [number, number, number] = [15, 23, 42]; // #0F172A
  const mutedRgb: [number, number, number] = [100, 116, 139]; // #64748B
  const successRgb: [number, number, number] = [16, 185, 129]; // #10B981
  const warningRgb: [number, number, number] = [245, 158, 11]; // #F59E0B
  const dangerRgb: [number, number, number] = [239, 68, 68]; // #EF4444

  // Page Header & Footer helper
  const addHeaderFooter = (pageNumber: number, title: string = 'Website Accessibility Audit Report') => {
    if (pageNumber === 1) return; // Skip on cover page

    // Header rule
    doc.setFontSize(8);
    doc.setTextColor(...mutedRgb);
    doc.text(brandName.toUpperCase() + '  |  ' + title, 14, 12);
    doc.text(audit.url, 196, 12, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 15, 196, 15);

    // Footer rule
    doc.line(14, 280, 196, 280);
    doc.setFontSize(8);
    doc.setTextColor(...mutedRgb);
    const tierBadge = planTier === 'free' ? 'FREE EVALUATION REPORT' : (planTier === 'pro' ? 'PRO AUDIT' : 'WHITE-LABEL AGENCY AUDIT');
    doc.text(`CONFIDENTIAL [${tierBadge}] — Prepared for ${audit.url} | W3C WCAG 2.2 AA Standard`, 14, 285);
    doc.text(`Page ${pageNumber}`, 196, 285, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  
  // Top brand banner
  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, 210, 12, 'F');

  // Plan tier badge on top right
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const tierName = planTier === 'free' ? 'FREE EVALUATION TIER' : (planTier === 'pro' ? 'PRO REPORT EDITION' : 'AGENCY WHITE-LABEL EDITION');
  doc.text(tierName, 196, 8, { align: 'right' });

  // Agency or Brand Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryRgb);
  doc.text(brandName.toUpperCase(), 20, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text(isAgency ? (agencyBranding.tagline || 'Accessibility & Digital Quality Assurance') : 'Automated WCAG 2.2 & ADA Compliance Platform', 20, 36);

  // Main Report Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Website Accessibility', 20, 58);
  doc.text('Audit & Executive Compliance Report', 20, 70);

  // Decorative Accent bar
  doc.setFillColor(...primaryRgb);
  doc.rect(20, 76, 30, 2.5, 'F');

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 86, 170, 48, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 86, 170, 48, 4, 4, 'S');

  doc.setFontSize(9);
  doc.setTextColor(...mutedRgb);
  doc.text('TARGET DOMAIN', 28, 96);
  doc.text('AUDIT DATE', 115, 96);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text(audit.url, 28, 103);
  doc.text(audit.timestamp, 115, 103);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('STANDARD BENCHMARK', 28, 116);
  doc.text('LEGAL COMPLIANCE RISK', 115, 116);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('W3C WCAG 2.1 & 2.2 Level AA / ADA Title III', 28, 123);

  const riskColor = audit.legalRiskLevel === 'High' ? dangerRgb : (audit.legalRiskLevel === 'Moderate' ? warningRgb : successRgb);
  doc.setTextColor(...riskColor);
  doc.text(`${audit.legalRiskLevel} Risk Level`, 115, 123);

  // Score Gauge Section
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 142, 170, 74, 4, 4, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedRgb);
  doc.text('OVERALL ACCESSIBILITY SCORE', 28, 154);

  // Huge Score Number
  doc.setFontSize(44);
  const scoreColor = audit.overallScore >= 80 ? successRgb : (audit.overallScore >= 60 ? warningRgb : dangerRgb);
  doc.setTextColor(...scoreColor);
  doc.text(`${audit.overallScore}`, 28, 176);

  doc.setFontSize(16);
  doc.setTextColor(...mutedRgb);
  doc.text('/ 100', 82, 176);

  // Traffic Light Status Badge
  doc.setFillColor(...scoreColor);
  doc.roundedRect(28, 184, 52, 7, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`TRAFFIC LIGHT: ${audit.status.toUpperCase()}`, 31, 189);

  // Right side of score card: Category Scores
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Sub-system Conformance Breakdown:', 105, 154);

  const metrics = [
    { label: 'Color & Contrast Pass Rate', val: `${audit.contrastPassRate}%` },
    { label: 'ARIA & Semantic Structure', val: `${audit.ariaComplianceScore}%` },
    { label: 'Keyboard & Navigation Flow', val: `${audit.keyboardNavigableScore}%` },
    { label: 'Elements Inspected', val: `${audit.scannedElementsCount}` },
  ];

  metrics.forEach((m, idx) => {
    const yPos = 164 + (idx * 11);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedRgb);
    doc.text(m.label, 105, yPos);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    doc.text(m.val, 178, yPos, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(105, yPos + 2.5, 178, yPos + 2.5);
  });

  // Severity Traffic-Light Summary Bar
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 224, 170, 36, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 224, 170, 36, 4, 4, 'S');

  // Traffic Light Counters
  // Red - Critical
  doc.setFillColor(...dangerRgb);
  doc.circle(38, 238, 5, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dangerRgb);
  doc.text(`${audit.criticalCount}`, 48, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('CRITICAL (RED)', 48, 246);

  // Amber - Moderate
  doc.setFillColor(...warningRgb);
  doc.circle(82, 238, 5, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...warningRgb);
  doc.text(`${audit.moderateCount}`, 92, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('MODERATE (AMBER)', 92, 246);

  // Gray - Minor
  doc.setFillColor(148, 163, 184);
  doc.circle(126, 238, 5, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(`${audit.minorCount}`, 136, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('MINOR (GRAY)', 136, 246);

  // Green - Passed
  doc.setFillColor(...successRgb);
  doc.circle(162, 238, 5, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...successRgb);
  doc.text(`${audit.passedCount}`, 172, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('PASSED (GREEN)', 172, 246);

  // ==========================================
  // PAGE 2: 1-PAGE EXECUTIVE SUMMARY (FOR BUSINESS OWNERS)
  // ==========================================
  doc.addPage();
  const execPageNum = doc.getNumberOfPages();
  addHeaderFooter(execPageNum, 'Executive Summary for Business Owners');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Executive Summary (Plain Language)', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('Designed for business stakeholders, executive leadership, and marketing managers.', 14, 32);

  // Executive Narrative Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 42, 3, 3, 'FD');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, 182, 42, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryRgb);
  doc.text('WHAT THIS SCORE MEANS FOR YOUR BUSINESS', 20, 47);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkRgb);
  const plainText = audit.plainExecutiveSummary || 
    `Your website currently scores ${audit.overallScore}/100. This indicates that while standard browsing works for typical users, visitors who rely on screen readers, keyboards, or high contrast face significant blockers. Remediating the ${audit.criticalCount} critical barriers below directly boosts checkout conversions and ensures full legal compliance under ADA Title III.`;
  
  const splitPlainText = doc.splitTextToSize(plainText, 170);
  doc.text(splitPlainText, 20, 56);

  // Top 3 Priority Fixes (Plain Language)
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Top 3 Priority Fixes (Actionable Roadmap)', 14, 90);

  const topPriorities = audit.topPriorityFixes || [
    '1. Fix low-contrast buttons so low-vision shoppers can find and click checkout actions.',
    '2. Add descriptive text to catalog images so screen-reader users can explore your products.',
    '3. Ensure popup modals allow keyboard users to tab through and dismiss with the Escape key.'
  ];

  let prioY = 96;
  topPriorities.forEach((item, index) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, prioY, 182, 22, 2, 2, 'FD');

    // Traffic light badge
    const badgeColor = index === 0 ? dangerRgb : (index === 1 ? warningRgb : primaryRgb);
    doc.setFillColor(...badgeColor);
    doc.roundedRect(20, prioY + 6, 8, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}`, 22.8, prioY + 11.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    const cleanItem = item.replace(/^\d+\.\s*/, '');
    const splitItem = doc.splitTextToSize(cleanItem, 155);
    doc.text(splitItem, 32, prioY + 11);

    prioY += 26;
  });

  // Business Impact & Legal Exposure Overview
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 180, 182, 54, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Business Value & Legal Compliance Context', 20, 192);

  const impactPoints = [
    '• Market Reach: Accessible web experiences expand your addressable audience by ~16% worldwide.',
    '• Conversion Lift: Streamlined keyboard and screen-reader journeys reduce bounce rates in key checkout steps.',
    '• Regulatory Compliance: Demonstrating proactive remediation safeguards against ADA Title III demand letters and aligns with European Accessibility Act (EAA) guidelines.'
  ];

  let impY = 202;
  impactPoints.forEach((pt) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkRgb);
    const splitPt = doc.splitTextToSize(pt, 168);
    doc.text(splitPt, 20, impY);
    impY += 8;
  });

  // ==========================================
  // TIER-BASED GATING LOGIC:
  // IF FREE TIER -> SHOW LOCKED PREVIEW & CTA, THEN RETURN
  // ==========================================
  if (planTier === 'free') {
    doc.addPage();
    const lockedPageNum = doc.getNumberOfPages();
    addHeaderFooter(lockedPageNum, 'Detailed Findings & Developer Code Fixes (Locked)');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    doc.text('Detailed WCAG Findings (Preview)', 14, 26);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedRgb);
    doc.text('Technical breakdown with code snippets, element selectors, and developer checklist.', 14, 32);

    // Mock blurred/locked issue rows
    let mockY = 40;
    for (let i = 0; i < 4; i++) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, mockY, 182, 28, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, mockY, 182, 28, 2, 2, 'S');

      // Locked placeholder bars
      doc.setFillColor(203, 213, 225);
      doc.rect(20, mockY + 6, 80, 4, 'F');
      doc.rect(20, mockY + 13, 140, 3, 'F');
      doc.rect(20, mockY + 18, 110, 3, 'F');

      mockY += 34;
    }

    // Locked Callout Overlay Card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(24, 75, 162, 85, 4, 4, 'FD');
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.roundedRect(24, 75, 162, 85, 4, 4, 'S');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text('🔒 Detailed Developer Report Locked', 35, 94);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkRgb);
    const lockExpl = [
      'This free evaluation provides your executive health score and high-level issue counts.',
      '',
      'Upgrade to AccessAudit Pro or Agency to unlock:',
      '• Exact DOM selectors, CSS classes, and HTML line items',
      '• Ready-to-copy faulty vs. corrected code snippets',
      '• Step-by-step developer remediation checklist with time estimates',
      '• White-label agency branding and multi-site client reporting'
    ];
    let expY = 104;
    lockExpl.forEach((line) => {
      doc.text(line, 35, expY);
      expY += 5.5;
    });

    // Upgrade CTA button graphic
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(35, 134, 140, 14, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Upgrade to Pro at https://accessaudit.io/pricing', 105, 143, { align: 'center' });

    return doc;
  }

  // ==========================================
  // IF PRO OR AGENCY TIER -> FULL DETAILED BREAKDOWN
  // ==========================================

  // Group issues by Category
  const categories = [
    { key: 'contrast', name: 'Color & Contrast (1.4.3 / 1.4.11)' },
    { key: 'images', name: 'Images & Media Descriptions (1.1.1)' },
    { key: 'keyboard', name: 'Keyboard Navigation & Focus Management (2.1.1 / 2.1.2)' },
    { key: 'forms', name: 'Forms, Input Labels & Error Feedback (3.3.1 / 3.3.2)' },
    { key: 'structure', name: 'Document Structure & Semantic Hierarchy (1.3.1)' },
    { key: 'aria', name: 'ARIA Roles, States & Properties (4.1.2)' }
  ];

  doc.addPage();
  const techPageNum = doc.getNumberOfPages();
  addHeaderFooter(techPageNum, 'Developer Details: Detailed WCAG Findings');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Developer Details: Detailed Findings', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('Organized by visual category with plain-language summaries and technical code fixes.', 14, 32);

  let currentY = 40;

  categories.forEach((cat) => {
    const catIssues = audit.issues.filter(i => i.category === cat.key);
    if (catIssues.length === 0) return;

    if (currentY > 230) {
      doc.addPage();
      const pNum = doc.getNumberOfPages();
      addHeaderFooter(pNum, 'Developer Details: Detailed WCAG Findings');
      currentY = 26;
    }

    // Category Section Header
    doc.setFillColor(...primaryRgb);
    doc.rect(14, currentY, 3, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    doc.text(cat.name.toUpperCase(), 20, currentY + 7);
    currentY += 14;

    catIssues.forEach((issue) => {
      if (currentY > 215) {
        doc.addPage();
        const pNum = doc.getNumberOfPages();
        addHeaderFooter(pNum, 'Developer Details: Detailed WCAG Findings');
        currentY = 26;
      }

      const issueCardHeight = issue.codeSnippetFaulty ? 48 : 34;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, 182, issueCardHeight, 2, 2, 'FD');

      // Traffic-light badge
      const sevColor = issue.severity === 'critical' ? dangerRgb : (issue.severity === 'moderate' ? warningRgb : mutedRgb);
      doc.setFillColor(...sevColor);
      doc.roundedRect(18, currentY + 4, 18, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(issue.severity.toUpperCase(), 27, currentY + 7.5, { align: 'center' });

      // Title & WCAG Rule
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkRgb);
      doc.text(issue.title, 40, currentY + 8);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedRgb);
      doc.text(`${issue.wcagRule} (Level ${issue.wcagLevel})`, 190, currentY + 8, { align: 'right' });

      // Plain language explanation first!
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...darkRgb);
      const plainExp = issue.plainSummary || issue.description;
      const splitPlain = doc.splitTextToSize(`Plain Summary: "${plainExp}"`, 172);
      doc.text(splitPlain, 18, currentY + 16);

      // Affected element selector
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedRgb);
      doc.text(`Affected Element: ${issue.affectedElement}`, 18, currentY + 24);

      // Code patch snippet if available
      if (issue.codeSnippetFaulty && issue.codeSnippetFix) {
        doc.setFillColor(241, 245, 249);
        doc.rect(18, currentY + 27, 85, 16, 'F');
        doc.rect(107, currentY + 27, 85, 16, 'F');

        doc.setFontSize(6.5);
        doc.setFont('courier', 'normal');
        doc.setTextColor(...dangerRgb);
        doc.text('// Current HTML (Issue)', 20, currentY + 31);
        doc.text(issue.codeSnippetFaulty.split('\n')[0].substring(0, 48), 20, currentY + 36);

        doc.setTextColor(...successRgb);
        doc.text('// Recommended Fix', 109, currentY + 31);
        doc.text(issue.codeSnippetFix.split('\n')[0].substring(0, 48), 109, currentY + 36);
      }

      currentY += issueCardHeight + 5;
    });

    currentY += 4;
  });

  // ==========================================
  // DEVELOPER CHECKLIST PAGE
  // ==========================================
  doc.addPage();
  const checkPageNum = doc.getNumberOfPages();
  addHeaderFooter(checkPageNum, 'Developer Remediation Checklist');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Developer Remediation Checklist', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedRgb);
  doc.text('Prioritized task matrix for engineering and frontend teams to achieve 100% WCAG 2.2 AA conformance.', 14, 32);

  const checklistRows = audit.checklist.map((item) => {
    return [
      '[  ]',
      item.severity.toUpperCase(),
      `WCAG ${item.wcagRule}`,
      item.task,
      `~${item.estimatedMinutes} mins`,
      item.completed ? 'COMPLETED' : 'PENDING'
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['Done', 'Priority', 'Rule', 'Action Item', 'Est. Time', 'Status']],
    body: checklistRows,
    theme: 'grid',
    headStyles: { fillColor: primaryRgb, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 82 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20, fontStyle: 'bold' }
    }
  });

  // ==========================================
  // AGENCY TIER EXCLUSIVE: MULTI-SITE COMPARISON (IF AGENCY)
  // ==========================================
  if (planTier === 'agency') {
    doc.addPage();
    const agencyPageNum = doc.getNumberOfPages();
    addHeaderFooter(agencyPageNum, 'Agency Portfolio Multi-Site Comparison');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    doc.text('Portfolio Multi-Site Benchmark', 14, 26);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedRgb);
    doc.text('Cross-domain compliance ranking and trend distribution for agency client accounts.', 14, 32);

    const multiSiteRows = [
      [audit.url, `${audit.overallScore}/100`, `${audit.criticalCount} Critical`, audit.legalRiskLevel, 'Active Client'],
      ['https://cloudflow-analytics.io', '84/100', '1 Critical', 'Low Risk', 'Monitored'],
      ['https://metrohealth-care.org', '54/100', '7 Critical', 'High Risk', 'Remediation In Progress'],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Client Domain', 'WCAG Score', 'Active Blockers', 'Legal Risk', 'Contract Status']],
      body: multiSiteRows,
      theme: 'striped',
      headStyles: { fillColor: primaryRgb, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 27 }
      }
    });

    // Priority-Ranked Remediation Roadmap Matrix
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkRgb);
    doc.text('Agency Remediation Phase Roadmap', 14, 105);

    const roadmaps = [
      { phase: 'Phase 1: Urgent Blockers (Days 1–7)', desc: 'Address all Red traffic-light issues (checkout contrast, form labels, missing alt text) to mitigate immediate ADA liability.' },
      { phase: 'Phase 2: Navigation & Flow (Days 8–21)', desc: 'Implement keyboard focus rings, modal trap handlers, and sequential heading outline fixes.' },
      { phase: 'Phase 3: Continuous Monitoring & Signoff (Day 22+)', desc: 'Deploy automated weekly regression scans and deliver final signed W3C WCAG 2.2 AA conformance badge.' }
    ];

    let rmY = 114;
    roadmaps.forEach((rm) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, rmY, 182, 22, 2, 2, 'FD');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryRgb);
      doc.text(rm.phase, 20, rmY + 7);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkRgb);
      doc.text(rm.desc, 20, rmY + 14);

      rmY += 26;
    });
  }

  // ==========================================
  // FINAL PAGE: NEXT STEPS & BRANDING
  // ==========================================
  doc.addPage();
  const lastPageNum = doc.getNumberOfPages();
  addHeaderFooter(lastPageNum, 'Next Steps & Continuous Monitoring');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkRgb);
  doc.text('Recommended Next Steps', 14, 26);

  const steps = [
    { title: '1. Remediate Critical Blockers First', desc: 'Prioritize items labeled CRITICAL, especially form labels, button contrast ratios, and keyboard traps that prevent end-users from completing core transactions.' },
    { title: '2. Integrate Continuous CI/CD Automated Audits', desc: 'Ensure accessibility regressions are caught before staging or production deploys via daily or weekly automated monitoring.' },
    { title: '3. Conduct Screen Reader Assistive Tech Testing', desc: 'Perform manual verification with VoiceOver (macOS/iOS) and NVDA (Windows) across key checkout and conversion funnels.' },
    { title: '4. Publish an Accessibility Conformance Statement', desc: 'Demonstrate active compliance and compliance roadmap to protect your organization from regulatory inquiries.' }
  ];

  let stepY = 38;
  steps.forEach((s) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, stepY, 182, 22, 2, 2, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text(s.title, 20, stepY + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkRgb);
    const splitDesc = doc.splitTextToSize(s.desc, 170);
    doc.text(splitDesc, 20, stepY + 14);

    stepY += 26;
  });

  // Agency / Service Contact Box
  doc.setFillColor(...primaryRgb);
  doc.roundedRect(14, stepY + 6, 182, 60, 4, 4, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isAgency ? `Partner With ${brandName}` : 'Continuous Monitoring & Automated Protection', 22, stepY + 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const promoText = isAgency
    ? `Need expert engineering assistance implementing these fixes? Our accessibility team at ${brandName} provides turnkey WCAG 2.2 AA remediation, manual assistive technology audits, and ongoing compliance monitoring.`
    : 'Upgrade to AccessAudit Pro or Agency Monitoring to track your website health continuously, receive instant alerts upon new code regressions, and generate white-label PDF audit reports for clients.';
  
  const splitPromo = doc.splitTextToSize(promoText, 166);
  doc.text(splitPromo, 22, stepY + 28);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Contact: ${contactEmail}   |   Website: ${websiteUrl}`, 22, stepY + 54);

  return doc;
}
