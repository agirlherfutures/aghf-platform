/**
 * wins-copy.js — A Girl & Her Futures™
 *
 * Centralized copy for "Share My Win": categories, reactions, consent
 * checkboxes (kept as 5 separate named options — never one combined
 * "share my story" checkbox), status labels shown to the member, the
 * empty-state, the risk disclosure, and moderation-action labels for the
 * admin console. No calculation logic, no member data — copy only.
 */

export const HERO_COPY = {
  eyebrow: '✦ Share My Win',
  title: 'Share My Win',
  tagline: 'Every win counts—not just profit.',
  supporting: 'Whether you passed an evaluation, followed your plan, finally understood market structure, or walked away from a bad setup—we want to celebrate it.',
  primaryCta: 'Share My Win',
  secondaryCta: 'See Recent Wins',
};

export const WIN_CATEGORIES = [
  { key: 'passed_evaluation', label: 'I Passed My Evaluation', icon: '🎯' },
  { key: 'funded_milestone', label: 'I Received a Payout', icon: '✦' },
  { key: 'mindset_breakthrough', label: 'Something Finally Clicked', icon: '💡' },
  { key: 'clean_execution_day', label: 'I Followed My Trading Plan', icon: '📋' },
  { key: 'walked_away_discipline', label: 'I Walked Away', icon: '🚪' },
  { key: 'consistency_streak', label: 'I Became More Consistent', icon: '📈' },
  { key: 'lesson_applied', label: 'I Completed an Academy Milestone', icon: '🎓' },
  { key: 'other', label: 'Something Else', icon: '✨' },
];

export function categoryLabel(key) {
  return WIN_CATEGORIES.find((c) => c.key === key)?.label || 'A Win';
}

export const HEADLINE_EXAMPLES = [
  'I Passed My First Evaluation',
  'I Finally Stopped Chasing',
  'Market Structure Finally Clicked',
  'My First Clean Week',
  'I Took the Loss and Walked Away',
];

export const STORY_PROMPTS = {
  main: 'What happened?',
  optional: [
    { key: 'whatChanged', label: 'What changed for you?' },
    { key: 'mostProud', label: 'What are you most proud of?' },
    { key: 'momentImportant', label: 'What made this moment important?' },
    { key: 'adviceForOthers', label: 'What would you tell another trader working toward this?' },
  ],
};

export const WHAT_HELPED_OPTIONS = [
  'AGHF Academy', 'Dayli ICC Method', 'Dayli ICC Checklist', 'Trade Journal', 'AGHF Agent',
  'Market Outlook', 'Chart Lab', 'My Playbook', 'Live Trading', 'Chart Clarity',
  'Premium Community', 'Dayli ICC Indicator', 'Risk-Management Lessons', 'Psychology Lessons',
  'Community Support', 'Something Else',
];

export const TESTIMONIAL_PROMPT = 'How did AGHF help make this possible?';

export const MEDIA_TYPES = [
  { key: 'screenshot', label: 'Chart Screenshot' },
  { key: 'certificate', label: 'Evaluation Certificate' },
  { key: 'payout_proof', label: 'Payout Proof' },
  { key: 'trading_screenshot', label: 'Trading Screenshot' },
  { key: 'member_photo', label: 'Member Photo' },
];

export const SENSITIVE_INFO_WARNING = 'Before uploading, cover account numbers, email addresses, legal names, balances, and any information you do not want shared.';
export const SENSITIVE_INFO_CONFIRM_LABEL = 'I reviewed this upload for sensitive information.';

export const REVIEW_PROMPTS = {
  rating: 'How has your overall AGHF experience been?',
  loveMost: 'What do you love most about AGHF?',
  couldImprove: 'What could make your experience even better?',
  privacyNote: 'This stays private, sent only to the AGHF team — it’s never shown publicly, and doesn’t change whether or how your win is shared.',
};

export const DISPLAY_NAME_OPTIONS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'first_name_last_initial', label: 'First Name + Last Initial' },
  { key: 'username', label: 'AGHF Username' },
  { key: 'anonymous', label: 'Anonymous' },
];

/** 5 separate, explicit consent choices — never combined into one vague
 * checkbox, never pre-selected. Keys match win_submissions.consent's
 * JSONB columns exactly. */
export const CONSENT_OPTIONS = [
  { key: 'winWall', label: 'Display inside the AGHF Academy Win Wall', help: 'Shown to other AGHF members on the Share My Win page.' },
  { key: 'communityFeature', label: 'Feature inside the AGHF community', help: 'May be highlighted or spotlighted for other members.' },
  { key: 'socialMedia', label: 'Share on AGHF social media', help: 'May appear on AGHF’s Instagram, TikTok, or other social accounts.' },
  { key: 'websitePromo', label: 'Use on the AGHF website or sales pages', help: 'May be used in marketing or promotional materials.' },
  { key: 'privateOnly', label: 'Do not share publicly — send only to Dayli and the AGHF team', help: 'Nothing public. This stays entirely internal.' },
];

export const CONSENT_REMOVAL_NOTE = 'You can change any of these choices, or ask for your win to be removed, at any time from My Wins.';

export const STATUS_LABELS = {
  draft: { label: 'Draft', help: 'Only visible to you — not yet submitted.' },
  submitted: { label: 'Submitted', help: 'Waiting for the AGHF team to take a first look.' },
  under_review: { label: 'Under Review', help: 'The AGHF team is reviewing this now.' },
  approved: { label: 'Approved', help: 'Live on the Win Wall, per your sharing choices.' },
  featured: { label: 'Featured', help: 'Highlighted as a Featured Win.' },
  needs_changes: { label: 'Needs a Small Update', help: 'AGHF would love a small update before this goes live.' },
  privately_received: { label: 'Privately Received', help: 'Sent to the AGHF team only, exactly as you chose.' },
  rejected: { label: 'Not Shared', help: 'This one won’t be shared — see the note below.' },
  archived: { label: 'Withdrawn', help: 'Withdrawn or removed — no longer visible anywhere.' },
};

export const SUBMIT_SUCCESS = {
  title: 'Your win has been shared with the AGHF team!',
  body: 'We’re proud of your progress. Your submission will be reviewed before anything appears publicly.',
};

export const EMPTY_STATE_COPY = {
  heading: 'Be the first to share your win ✦',
  body: 'Every AGHF story starts somewhere. Whatever you’re celebrating today — big or small — it belongs here.',
  cta: 'Share My Win',
};

export const RISK_DISCLOSURE_TEXT = 'Individual experiences vary. Trading involves risk, and results are not guaranteed.';

/** 5 positive-only reactions — no downvote type exists anywhere in this
 * vocabulary or the DB CHECK constraint backing it. */
export const REACTION_TYPES = [
  { key: 'love_this', label: 'Love This', emoji: '💗' },
  { key: 'proud_of_you', label: 'Proud of You', emoji: '✨' },
  { key: 'helped_me', label: 'This Helped Me', emoji: '🙌' },
  { key: 'inspired', label: 'Inspired', emoji: '🌟' },
  { key: 'same_breakthrough', label: 'Same Breakthrough', emoji: '🎯' },
];

export const WIN_FILTERS = [
  { key: 'all', label: 'All Wins' },
  ...WIN_CATEGORIES,
];

export const MODERATION_ACTION_LABELS = {
  start_review: 'Start Review',
  approve: 'Approve',
  request_changes: 'Request Changes',
  reject: 'Not Shared',
  feature: 'Feature',
  unfeature: 'Unfeature',
  verify: 'Verify Proof',
  unverify: 'Remove Verification',
  archive: 'Archive',
  edit_testimonial_wording: 'Edit Wording',
  add_note: 'Add Internal Note',
};
