/**
 * economic-calendar-service.js — A Girl & Her Futures™
 *
 * Data layer for the "Today's News" economic-calendar card. No calendar
 * API/scrape exists anywhere in this codebase — this returns typed mock
 * data with isDemo:true, never presented as live. Swap this file's
 * internals for a real fetch later; callers only depend on the
 * EconomicEvent shape from dashboard-models.js.
 */

const DEMO_EVENTS = [
  { id: 'ism-pmi', timeOfDay: [10, 0], event: 'ISM Manufacturing PMI', currency: 'USD', impact: 'high', marketsAffected: ['MNQ', 'ES', 'Gold'] },
  { id: 'cpi', timeOfDay: [8, 30], event: 'Core CPI m/m', currency: 'USD', impact: 'high', marketsAffected: ['MNQ', 'ES', 'Gold'] },
  { id: 'jobless', timeOfDay: [8, 30], event: 'Initial Jobless Claims', currency: 'USD', impact: 'medium', marketsAffected: ['MNQ', 'ES'] },
];

/** @returns {Promise<import('./dashboard-models.js').EconomicEvent[]>} */
export async function getTodaysEvents() {
  const now = new Date();
  return DEMO_EVENTS.map((e) => {
    const eventTime = new Date(now);
    eventTime.setHours(e.timeOfDay[0], e.timeOfDay[1], 0, 0);
    const minutesUntil = Math.round((eventTime.getTime() - now.getTime()) / 60000);
    return {
      id: e.id,
      time: eventTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' ET',
      event: e.event, currency: e.currency, impact: e.impact,
      minutesUntil, marketsAffected: e.marketsAffected, isDemo: true,
    };
  }).sort((a, b) => a.minutesUntil - b.minutesUntil);
}

export const ECONOMIC_CALENDAR_IS_LIVE = false;
