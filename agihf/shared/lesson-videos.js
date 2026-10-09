/**
 * lesson-videos.js — A Girl & Her Futures™
 * Lesson intro videos, hosted in the public Supabase Storage bucket
 * "lesson-videos" as <lesson id>.mp4 (e.g. p3-5.mp4).
 *
 * Only ids listed in UPLOADED get a player; every other lesson keeps its
 * "Video coming soon" card, so a missing upload never shows a broken video.
 * A lesson's own videoUrl in its JSON always wins.
 */
export const VIDEO_BASE = 'https://otxfzalcujhtfwprmptr.supabase.co/storage/v1/object/public/lesson-videos/';

export const UPLOADED = new Set([
]);

/** The hosted video for lesson `id` ("p3-5"), or null. */
export const videoFor = (id) => (UPLOADED.has(id) ? `${VIDEO_BASE}${id}.mp4` : null);
