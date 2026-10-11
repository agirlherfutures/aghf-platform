/**
 * entry-models.js — A Girl & Her Futures™
 *
 * The setups a member can pick in the journal's "Why did you enter?" step,
 * and the entry rules each one asks her to check. Dayli ICC keeps its rules
 * in entry.iccChecklist (so existing stats keep working); every other setup
 * keeps them in entry.entryModel.steps.
 *
 * Supply & Demand follows strategy-lab/SUPPLY_DEMAND_MASTER.md:
 * 3 breaks, 2 corrections, 1 zone, 1 retest, then a close back out of the zone.
 */

export const ENTRY_MODELS = {
  icc: {
    label: 'Dayli ICC',
    sub: 'PIL, Indication, Correction, Continuation, Retest',
    question: 'Did you wait for <em class="jv-u">all five?</em>',
    steps: () => [
      { key: 'validPil', short: 'PIL', label: 'Valid PIL' },
      { key: 'indication', short: 'Ind', label: 'Indication' },
      { key: 'correction', short: 'Corr', label: 'Correction' },
      { key: 'continuation', short: 'Cont', label: 'Continuation' },
      { key: 'firstRetest', short: 'Retest', label: 'First retest' },
    ],
    extras: () => [
      { key: 'bias4hAligned', label: '4H bias aligned' },
      { key: 'structure1hAligned', label: '1H structure aligned' },
    ],
  },
  snd: {
    label: 'Supply & Demand',
    sub: '3 breaks, 2 corrections, 1 zone, 1 retest',
    question: 'Did you wait for the <em class="jv-u">full sequence?</em>',
    steps: (direction) => [
      { key: 'bos1', short: 'BOS 1', label: 'BOS #1 (15M)' },
      { key: 'c1', short: 'C1', label: 'Correction #1' },
      { key: 'bos2', short: 'BOS 2', label: 'BOS #2' },
      { key: 'c2', short: 'C2', label: 'Correction #2 (zone)' },
      { key: 'bos3', short: 'BOS 3', label: 'BOS #3' },
      { key: 'retest', short: 'Retest', label: 'Back into the zone' },
      { key: 'closeOut', short: 'Close', label: direction === 'short' ? 'Closed back below the zone' : 'Closed back above the zone' },
    ],
    extras: () => [
      { key: 'reclaim15m', label: 'Reclaimed the 15M level (optional)' },
    ],
  },
  other: {
    label: 'My own setup',
    sub: 'Name it and note what you saw',
    question: 'What did <em class="jv-u">you see?</em>',
    steps: () => [],
    extras: () => [],
  },
};

/** Which setup an entry used. Older entries with an ICC checklist count as Dayli ICC. */
export function entrySetup(entry) {
  if (entry.entryModel?.setup && ENTRY_MODELS[entry.entryModel.setup]) return entry.entryModel.setup;
  if (entry.iccChecklist) return 'icc';
  return null;
}

/** The checked state of one rule, wherever that setup keeps it. */
export function ruleChecked(entry, setup, key) {
  if (setup === 'icc') return !!entry.iccChecklist?.[key];
  return !!entry.entryModel?.steps?.[key];
}

/** [{key, short, label, on}] for the entry's setup, or [] when it has no rule steps. */
export function entrySteps(entry) {
  const setup = entrySetup(entry);
  if (!setup) return [];
  return ENTRY_MODELS[setup].steps(entry.direction).map((s) => ({ ...s, on: ruleChecked(entry, setup, s.key) }));
}

/** Share of the setup's rules (steps and extras) that were checked, 0 to 1, or null. */
export function setupCompletion(entry) {
  const setup = entrySetup(entry);
  if (!setup || setup === 'other') return null;
  const all = [...ENTRY_MODELS[setup].steps(entry.direction), ...ENTRY_MODELS[setup].extras().filter((x) => !/optional/i.test(x.label))];
  return all.filter((s) => ruleChecked(entry, setup, s.key)).length / all.length;
}

/** The name shown for the setup: the model's label, or her own name for it. */
export function setupName(entry) {
  const setup = entrySetup(entry);
  if (setup === 'other') return entry.entryModel?.name || entry.setupType || 'My own setup';
  return setup ? ENTRY_MODELS[setup].label : entry.setupType || '';
}
