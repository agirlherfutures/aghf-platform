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
  // Phase 1: Dayli's final videos from the AGHF Video Merge folder.
  'p1-1', 'p1-2', 'p1-3', 'p1-4', 'p1-5', 'p1-6', 'p1-7', 'p1-8', 'p1-9', 'p1-10', 'p1-11', 'p1-12', 'p1-13', 'p1-14', 'p1-15', 'p1-16', 'p1-17', 'p1-18',
  // Phase 2 · Section 4 (How Markets Move): the first batch, to check the compressed quality.
  'p2-1', 'p2-2', 'p2-3', 'p2-4', 'p2-5', 'p2-6', 'p2-7', 'p2-8', 'p2-9',
]);

/** The hosted video for lesson `id` ("p3-5"), or null. */
export const videoFor = (id) => (UPLOADED.has(id) ? `${VIDEO_BASE}${id}.mp4` : null);
