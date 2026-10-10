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
  // Phase 2.
  'p2-1', 'p2-2', 'p2-3', 'p2-4', 'p2-5', 'p2-6', 'p2-7', 'p2-8', 'p2-9', 'p2-10', 'p2-11', 'p2-12', 'p2-13', 'p2-14', 'p2-15', 'p2-16', 'p2-17', 'p2-18', 'p2-19', 'p2-20', 'p2-21', 'p2-22', 'p2-23', 'p2-24',
  // Phase 3.
  'p3-1', 'p3-2', 'p3-3', 'p3-4', 'p3-5', 'p3-6', 'p3-7', 'p3-8', 'p3-9', 'p3-10', 'p3-11', 'p3-12', 'p3-13', 'p3-14', 'p3-15', 'p3-16', 'p3-17', 'p3-18', 'p3-19', 'p3-20', 'p3-21', 'p3-22', 'p3-23', 'p3-24', 'p3-25', 'p3-26', 'p3-27',
  // Phase 4.
  'p4-1', 'p4-2', 'p4-3', 'p4-4', 'p4-5', 'p4-6', 'p4-7', 'p4-8', 'p4-9', 'p4-10', 'p4-11', 'p4-12', 'p4-13', 'p4-14', 'p4-15', 'p4-16', 'p4-17', 'p4-18', 'p4-19', 'p4-20', 'p4-21',
  // Phase 5.
  'p5-1', 'p5-2', 'p5-3', 'p5-4', 'p5-5', 'p5-6', 'p5-7', 'p5-8', 'p5-9', 'p5-10', 'p5-11', 'p5-12', 'p5-13', 'p5-14', 'p5-15', 'p5-16', 'p5-17', 'p5-18', 'p5-19', 'p5-20', 'p5-21', 'p5-22', 'p5-23', 'p5-24', 'p5-25', 'p5-26', 'p5-27', 'p5-28', 'p5-29', 'p5-30',
  // Phase 6.
  'p6-1', 'p6-2', 'p6-3', 'p6-4', 'p6-5', 'p6-6', 'p6-7', 'p6-8', 'p6-9', 'p6-10', 'p6-11', 'p6-12', 'p6-13', 'p6-14', 'p6-15', 'p6-16', 'p6-17', 'p6-18', 'p6-19', 'p6-20', 'p6-21', 'p6-22', 'p6-23', 'p6-24', 'p6-25', 'p6-26',
  // Phase 8.
  'p8-1', 'p8-2', 'p8-3', 'p8-4', 'p8-5', 'p8-6', 'p8-7', 'p8-8', 'p8-9', 'p8-10', 'p8-11', 'p8-12', 'p8-13', 'p8-14', 'p8-15', 'p8-16', 'p8-17', 'p8-18', 'p8-19', 'p8-20', 'p8-21', 'p8-22',
]);

/** The hosted video for lesson `id` ("p3-5"), or null. */
export const videoFor = (id) => (UPLOADED.has(id) ? `${VIDEO_BASE}${id}.mp4` : null);
