/**
 * Maps raw axe-core results into the app's AuditResult/AuditIssue shape.
 */
import { AuditIssue, AuditResult, Category, DeveloperChecklistItem, Severity } from '../types';

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeRuleResult {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

interface AxeResults {
  violations: AxeRuleResult[];
  passes: AxeRuleResult[];
  incomplete: AxeRuleResult[];
}

const CATEGORY_TAG_MAP: Record<string, Category> = {
  'cat.color': 'contrast',
  'cat.text-alternatives': 'images',
  'cat.keyboard': 'keyboard',
  'cat.forms': 'forms',
  'cat.aria': 'aria',
  'cat.name-role-value': 'aria',
  'cat.semantics': 'structure',
  'cat.structure': 'structure',
  'cat.language': 'structure',
  'cat.parsing': 'structure',
  'cat.tables': 'structure',
  'cat.sensory-and-visual-cues': 'contrast',
  'cat.time-and-media': 'structure',
};

export function categoryFromTags(tags: string[]): Category {
  for (const tag of tags) {
    if (CATEGORY_TAG_MAP[tag]) return CATEGORY_TAG_MAP[tag];
  }
  return 'structure';
}

export function severityFromImpact(impact: AxeRuleResult['impact']): Severity {
  if (impact === 'critical' || impact === 'serious') return 'critical';
  if (impact === 'moderate') return 'moderate';
  return 'minor';
}

export function wcagRefFromTags(tags: string[]): { rule: string; level: 'A' | 'AA' | 'AAA' } {
  let level: 'A' | 'AA' | 'AAA' = 'A';
  let sc = '';

  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d)(\d{1,2})$/);
    if (match) {
      sc = `${match[1]}.${match[2]}.${match[3]}`;
    }
    if (/^wcag\d+aaa$/.test(tag)) level = 'AAA';
    else if (/^wcag\d+aa$/.test(tag) && level !== 'AAA') level = 'AA';
  }

  return { rule: sc ? `WCAG ${sc}` : 'Best Practice', level };
}

function estimatedMinutesFor(severity: Severity): number {
  if (severity === 'critical') return 30;
  if (severity === 'moderate') return 15;
  return 10;
}

export function buildAuditResult(
  targetUrl: string,
  axeResults: AxeResults,
  scannedElementsCount: number
): AuditResult {
  const issues: AuditIssue[] = axeResults.violations.map((rule, idx) => {
    const category = categoryFromTags(rule.tags);
    const severity = severityFromImpact(rule.impact);
    const { rule: wcagRule, level: wcagLevel } = wcagRefFromTags(rule.tags);
    const primaryNode = rule.nodes[0];
    const affectedElement = rule.nodes
      .slice(0, 3)
      .map(n => n.target.join(' '))
      .join(', ') || rule.id;

    return {
      id: `axe-${rule.id}-${idx}`,
      category,
      severity,
      title: rule.help,
      description: rule.description,
      wcagRule,
      wcagLevel,
      affectedElement,
      codeSnippetFaulty: primaryNode?.html?.slice(0, 500),
      impact: primaryNode?.failureSummary || `${rule.nodes.length} element(s) affected on the page.`,
      howToFix: rule.helpUrl ? `${rule.help}. See: ${rule.helpUrl}` : rule.help,
    };
  });

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const moderateCount = issues.filter(i => i.severity === 'moderate').length;
  const minorCount = issues.filter(i => i.severity === 'minor').length;
  const passedCount = axeResults.passes.length;

  const penalty = criticalCount * 12 + moderateCount * 5 + minorCount * 2;
  const overallScore = Math.max(0, Math.min(100, 100 - penalty));

  const passRateFor = (predicate: (r: AxeRuleResult) => boolean): number => {
    const passed = axeResults.passes.filter(predicate).length;
    const failed = axeResults.violations.filter(predicate).length;
    const total = passed + failed;
    return total === 0 ? 100 : Math.round((passed / total) * 100);
  };

  const contrastPassRate = passRateFor(r => categoryFromTags(r.tags) === 'contrast');
  const ariaComplianceScore = passRateFor(r => categoryFromTags(r.tags) === 'aria');
  const keyboardNavigableScore = passRateFor(r => categoryFromTags(r.tags) === 'keyboard');

  const grade = overallScore >= 90 ? 'AAA' : overallScore >= 75 ? 'AA' : 'Needs Remediation';
  const status = overallScore >= 80 ? 'passed' : overallScore >= 65 ? 'warning' : 'failed';
  const legalRiskLevel = overallScore < 70 ? 'High' : overallScore < 85 ? 'Moderate' : 'Low';

  const checklist: DeveloperChecklistItem[] = issues.map((issue, idx) => ({
    id: `chk-${idx}`,
    task: issue.title,
    wcagRule: issue.wcagRule.replace('WCAG ', ''),
    severity: issue.severity,
    completed: false,
    estimatedMinutes: estimatedMinutesFor(issue.severity),
  }));

  const topPriorityFixes = issues
    .filter(i => i.severity === 'critical')
    .slice(0, 3)
    .map(i => i.title);

  return {
    id: `audit-${Date.now()}`,
    url: targetUrl,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    overallScore,
    grade,
    status,
    summary: `Automated WCAG 2.2 accessibility scan for ${targetUrl}. Detected ${criticalCount} critical, ${moderateCount} moderate, and ${minorCount} minor issue(s) across ${passedCount + issues.length} evaluated rules.`,
    plainExecutiveSummary: criticalCount > 0
      ? `This site scores ${overallScore}/100. ${criticalCount} critical accessibility blocker(s) were found that likely prevent some users from completing key tasks.`
      : `This site scores ${overallScore}/100 with no critical blockers detected. ${moderateCount} moderate issue(s) remain to reach stronger WCAG conformance.`,
    topPriorityFixes,
    criticalCount,
    moderateCount,
    minorCount,
    passedCount,
    issues,
    checklist,
    scannedElementsCount,
    contrastPassRate,
    ariaComplianceScore,
    keyboardNavigableScore,
    legalRiskLevel,
  };
}
