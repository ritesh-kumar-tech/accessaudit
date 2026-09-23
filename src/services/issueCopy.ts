/**
 * Curated, non-technical copy for the most common axe-core rules, used to make
 * free-tier reports readable by someone who isn't a developer: what's wrong in
 * plain words, why it's risky to leave unfixed, and a directional hint at the
 * fix (the exact code patch stays behind the paid tiers via howToFix/codeSnippetFix).
 */
import { Category, Severity } from '../types';

export interface IssueCopyEntry {
  plainSummary: string;
  riskStatement: string;
  freeHint: string;
}

export const ISSUE_COPY: Record<string, IssueCopyEntry> = {
  'color-contrast': {
    plainSummary: 'Some text on your site is too faint against its background for many people to read comfortably.',
    riskStatement: 'Low-vision and older visitors may not be able to read this text at all — contrast failures are one of the most commonly cited issues in ADA and EAA accessibility complaints.',
    freeHint: 'Darken the text color or lighten the background so they meet a 4.5:1 contrast ratio.',
  },
  'image-alt': {
    plainSummary: 'Some images on your site have no description for people who use screen readers.',
    riskStatement: 'Blind and low-vision visitors using a screen reader hear nothing where these images are — if any of them are product photos or key visuals, that\'s a broken experience and a legal exposure point.',
    freeHint: 'Add a short, descriptive alt attribute to each image explaining what it shows.',
  },
  'input-image-alt': {
    plainSummary: 'An image used as a clickable button has no label describing what it does.',
    riskStatement: 'A screen reader announces this control as just "button" with no purpose — visitors relying on assistive tech may not be able to complete the action at all.',
    freeHint: 'Give the image input a descriptive alt attribute stating what it submits or does.',
  },
  'label': {
    plainSummary: 'One or more form fields (like email or name inputs) don\'t have a label a screen reader can announce.',
    riskStatement: 'Visitors using assistive technology can\'t tell what to type into these fields — this directly blocks signups, checkouts, and contact forms.',
    freeHint: 'Connect a visible <label> to each input using its "for"/"id" attributes.',
  },
  'form-field-multiple-labels': {
    plainSummary: 'A form field is described by more than one conflicting label.',
    riskStatement: 'Screen readers may announce confusing or duplicate instructions, making the field hard to fill in correctly.',
    freeHint: 'Keep exactly one label per field, or merge the label text into a single element.',
  },
  'select-name': {
    plainSummary: 'A dropdown menu (select) on your site has no accessible name.',
    riskStatement: 'Screen reader users hear an unlabeled control and won\'t know what choice they\'re making — a common blocker on checkout and signup forms.',
    freeHint: 'Add a visible, connected label describing what the dropdown selects.',
  },
  'link-name': {
    plainSummary: 'Some links on your site have no readable text — often an icon or image with nothing describing where it goes.',
    riskStatement: 'Screen reader users hear "link" with no destination, which is one of the top frustrations cited in accessibility complaints and lawsuits.',
    freeHint: 'Add descriptive text or an aria-label explaining where each link goes.',
  },
  'button-name': {
    plainSummary: 'Some buttons on your site have no readable label — often an icon-only button with no description.',
    riskStatement: 'A screen reader announces "button" with no purpose, so visitors relying on assistive tech can\'t tell what it does before activating it.',
    freeHint: 'Add visible text or an aria-label describing what the button does.',
  },
  'heading-order': {
    plainSummary: 'Your page\'s headings skip levels or are out of order (for example jumping from a main heading straight to a sub-sub-heading).',
    riskStatement: 'Screen reader users navigate pages by heading structure — a broken hierarchy makes your content much harder to scan and understand.',
    freeHint: 'Reorder headings so they step down one level at a time (H1 → H2 → H3).',
  },
  'html-has-lang': {
    plainSummary: 'Your page doesn\'t declare what language it\'s written in.',
    riskStatement: 'Screen readers may mispronounce your entire page, and translation tools may fail — a quick, high-impact fix.',
    freeHint: 'Add a lang attribute (e.g. lang="en") to the <html> tag.',
  },
  'document-title': {
    plainSummary: 'This page has no title, or a title that doesn\'t describe the page.',
    riskStatement: 'Screen reader and browser-tab users can\'t tell what page they\'re on, hurting both accessibility and search visibility.',
    freeHint: 'Give the page a short, descriptive <title>.',
  },
  'list': {
    plainSummary: 'Content that looks like a list isn\'t marked up as one, so assistive tech can\'t announce it as a list.',
    riskStatement: 'Screen reader users lose the count and structure of list items, making navigation and content harder to follow.',
    freeHint: 'Wrap list items in proper <ul>/<ol> and <li> elements.',
  },
  'aria-required-attr': {
    plainSummary: 'An element uses an ARIA role but is missing information that role requires to work correctly.',
    riskStatement: 'Assistive technology may misreport this element\'s state (e.g. checked, expanded), leading to confusing or broken interactions.',
    freeHint: 'Add the missing required ARIA attribute(s) for this element\'s role.',
  },
  'aria-valid-attr-value': {
    plainSummary: 'An ARIA attribute on your page has an invalid value.',
    riskStatement: 'Assistive technology may ignore or misinterpret this element entirely, silently breaking the experience for those users.',
    freeHint: 'Correct the ARIA attribute value to one the specification allows.',
  },
  'aria-valid-attr': {
    plainSummary: 'Your page uses an ARIA attribute that doesn\'t exist or is misspelled.',
    riskStatement: 'Browsers and screen readers ignore unrecognized attributes, so the accessibility information you intended never reaches the user.',
    freeHint: 'Fix the attribute name to match a valid ARIA attribute.',
  },
  'aria-roles': {
    plainSummary: 'An element has an ARIA role that isn\'t valid for its type.',
    riskStatement: 'Screen readers may announce the wrong purpose for this element, misleading assistive-tech users about how to interact with it.',
    freeHint: 'Use a valid ARIA role for this element, or remove it if unnecessary.',
  },
  'duplicate-id': {
    plainSummary: 'The same ID is used on more than one element on this page.',
    riskStatement: 'Duplicate IDs can break form labels, ARIA references, and keyboard navigation in unpredictable ways for assistive-tech users.',
    freeHint: 'Make every element ID on the page unique.',
  },
  'landmark-one-main': {
    plainSummary: 'This page has no single, clear "main content" region.',
    riskStatement: 'Screen reader users rely on landmarks to skip straight to the main content — without one, they must wade through the entire page manually.',
    freeHint: 'Wrap your primary content in a single <main> element.',
  },
  'region': {
    plainSummary: 'Some content on the page sits outside any landmark region (header, nav, main, footer).',
    riskStatement: 'Screen reader users navigating by landmark may miss this content entirely.',
    freeHint: 'Place all visible content inside an appropriate landmark element.',
  },
  'tabindex': {
    plainSummary: 'An element has a positive tabindex, which reorders keyboard navigation in a confusing way.',
    riskStatement: 'Keyboard-only users may jump erratically around the page instead of following the natural reading order.',
    freeHint: 'Remove the positive tabindex and rely on natural DOM order instead.',
  },
  'nested-interactive': {
    plainSummary: 'One clickable element (like a button or link) is nested inside another.',
    riskStatement: 'Screen readers and keyboard users get inconsistent or broken behavior when interactive elements are nested this way.',
    freeHint: 'Restructure the markup so interactive elements don\'t contain each other.',
  },
  'frame-title': {
    plainSummary: 'An embedded frame (like a video or map) has no title describing its content.',
    riskStatement: 'Screen reader users have no idea what the embedded content is before entering it.',
    freeHint: 'Add a descriptive title attribute to the <iframe>.',
  },
  'svg-img-alt': {
    plainSummary: 'A meaningful SVG graphic has no accessible description.',
    riskStatement: 'Screen reader users get no information about what this graphic communicates.',
    freeHint: 'Add a <title> element inside the SVG or an aria-label describing it.',
  },
  'video-caption': {
    plainSummary: 'A video on your site has no captions.',
    riskStatement: 'Deaf and hard-of-hearing visitors can\'t follow the video\'s content — captions are explicitly required under WCAG and commonly cited in litigation.',
    freeHint: 'Add a captions track (e.g. WebVTT) to the video.',
  },
  'meta-viewport': {
    plainSummary: 'Pinch-to-zoom has been disabled on your page.',
    riskStatement: 'Low-vision visitors who rely on zooming to read your content are locked out.',
    freeHint: 'Remove user-scalable=no and maximum-scale restrictions from the viewport meta tag.',
  },
  'keyboard': {
    plainSummary: 'Part of your page can only be used with a mouse — keyboard-only visitors get stuck.',
    riskStatement: 'Keyboard-only and switch-device users (including many people with motor disabilities) cannot complete this interaction at all.',
    freeHint: 'Make sure every interactive element can be reached and activated with the keyboard alone.',
  },
};

function titleCaseFromRuleId(ruleId: string): string {
  return ruleId.replace(/-/g, ' ');
}

const RISK_BY_SEVERITY: Record<Severity, string> = {
  critical: 'This is a critical, high-visibility barrier — the kind of issue most often flagged in ADA Title III and EAA accessibility complaints.',
  moderate: 'This creates real friction for some visitors and is a common finding in accessibility audits and legal reviews.',
  minor: 'This is a smaller usability gap, but still worth addressing to reach full WCAG conformance.',
  passed: 'This check already passes.',
};

/** Best-effort plain-language copy for any axe rule not in the curated table above — never leaves a free-tier reader with a blank explanation. */
export function getIssueCopy(ruleId: string, severity: Severity, fallbackHelpText: string): IssueCopyEntry {
  const curated = ISSUE_COPY[ruleId];
  if (curated) return curated;

  return {
    plainSummary: `An accessibility problem was found related to "${titleCaseFromRuleId(ruleId)}": ${fallbackHelpText}`,
    riskStatement: RISK_BY_SEVERITY[severity],
    freeHint: 'Upgrade to see the exact element and the recommended fix for this issue.',
  };
}
