/**
 * business-dashboard-service.js — A Girl & Her Futures™
 *
 * Client for the admin-only Whop Business Dashboard (agihf/api/
 * billing-data.js, resource=dashboard/sync). No demo-mode fallback here —
 * unlike the member-facing features, this page is never meant to be
 * clicked through by a non-admin previewer, and its numbers are real
 * money, so there is no seeded mock data to fall back to.
 */

import { authFetch as apiFetch } from './auth-fetch.js';

/** @returns {Promise<object>} dashboard stats — see billing-data.js's handleDashboard for the exact shape */
export async function getDashboardStats() {
  return apiFetch('/api/business-dashboard');
}

/** Triggers a best-effort backfill/reconciliation pull from the Whop API. */
export async function triggerSync() {
  return apiFetch('/api/business-sync', { method: 'POST' });
}
