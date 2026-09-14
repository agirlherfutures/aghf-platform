#!/usr/bin/env node
// Reads draft newsletters from newsletter/drafts/*.md and schedules each one
// as a broadcast via the Kit (ConvertKit) v4 API. Kit handles the actual send
// at send_at — this script's job is only to register drafts with Kit and mark
// them so they aren't submitted twice.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = join(__dirname, '..', 'drafts');
const API_BASE = 'https://api.kit.com/v4';
const DRY_RUN = process.env.DRY_RUN !== 'false';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('missing --- frontmatter block');
  }
  const [, fmBlock, body] = match;
  const fields = {};
  for (const line of fmBlock.split('\n')) {
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return { fields, body: body.trim() };
}

function serializeDraft(fields, body) {
  const fmLines = Object.entries(fields).map(([key, value]) => {
    const needsQuotes = /[:#]/.test(String(value)) || String(value) === '';
    return `${key}: ${needsQuotes ? `"${value}"` : value}`;
  });
  return `---\n${fmLines.join('\n')}\n---\n\n${body}\n`;
}

function bodyToHtml(body) {
  if (/^\s*</.test(body)) return body; // already HTML
  return body
    .split(/\n{2,}/)
    .map((para) => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

async function createBroadcast(apiKey, { subject, sendAt, html }) {
  const res = await fetch(`${API_BASE}/broadcasts`, {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      content: html,
      description: subject,
      public: true,
      send_at: sendAt,
    }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(`Kit API ${res.status}: ${text.slice(0, 500)}`);
  }
  const id = json?.broadcast?.id ?? json?.id;
  if (!id) {
    throw new Error(`Kit API returned no broadcast id: ${text.slice(0, 500)}`);
  }
  return id;
}

async function main() {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    console.error('KIT_API_KEY is not set — aborting.');
    process.exit(1);
  }

  const files = (await readdir(DRAFTS_DIR)).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('No draft files found.');
    return;
  }

  let changed = 0;
  let failed = 0;

  for (const file of files) {
    const path = join(DRAFTS_DIR, file);
    const raw = await readFile(path, 'utf8');

    let fields, body;
    try {
      ({ fields, body } = parseFrontmatter(raw));
    } catch (err) {
      console.error(`[${file}] skipped — ${err.message}`);
      continue;
    }

    if (fields.status !== 'draft') {
      console.log(`[${file}] skipped — status is "${fields.status ?? '(none)'}"`);
      continue;
    }
    if (!fields.subject) {
      console.error(`[${file}] skipped — missing "subject"`);
      continue;
    }
    if (!fields.send_at) {
      console.error(`[${file}] skipped — missing "send_at"`);
      continue;
    }
    if (new Date(fields.send_at).getTime() <= Date.now()) {
      console.error(`[${file}] skipped — send_at (${fields.send_at}) is in the past`);
      continue;
    }

    const html = bodyToHtml(body);

    if (DRY_RUN) {
      console.log(`[${file}] DRY RUN — would schedule "${fields.subject}" for ${fields.send_at}`);
      continue;
    }

    try {
      const broadcastId = await createBroadcast(apiKey, {
        subject: fields.subject,
        sendAt: fields.send_at,
        html,
      });
      const updated = {
        ...fields,
        status: 'scheduled',
        broadcast_id: broadcastId,
      };
      await writeFile(path, serializeDraft(updated, body));
      console.log(`[${file}] scheduled as broadcast ${broadcastId} for ${fields.send_at}`);
      changed++;
    } catch (err) {
      const updated = {
        ...fields,
        status: 'error',
        error_message: err.message.replace(/\n/g, ' ').slice(0, 300),
      };
      await writeFile(path, serializeDraft(updated, body));
      console.error(`[${file}] FAILED — ${err.message}`);
      failed++;
    }
  }

  console.log(`Done. ${changed} scheduled, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main();
