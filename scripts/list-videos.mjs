#!/usr/bin/env node
// Fase 2.5 rota A — lista vídeos via /v1/video.list (chamada gratuita).
// Uso: node scripts/list-videos.mjs [--title <filtro>] [--limit N]
// Key vem do .env privado do heygen-cli (nunca deste repo).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ENV_PATH = process.env.HEYGEN_ENV_PATH || path.join(os.homedir(), ".config/heygen/.env");
const env = {};
try {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const KEY = env.HEYGEN_API_KEY;
if (!KEY) { console.error(`HEYGEN_API_KEY não encontrada em ${ENV_PATH}`); process.exit(1); }

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const titleFilter = opt("--title", "");
const limit = Number(opt("--limit", "30"));

const r = await fetch(`https://api.heygen.com/v1/video.list?limit=${limit}`, {
  headers: { "X-Api-Key": KEY, Accept: "application/json" },
});
if (!r.ok) { console.error(`HTTP ${r.status}: ${await r.text()}`); process.exit(1); }
const data = await r.json();
const videos = data?.data?.videos || [];
for (const v of videos) {
  if (titleFilter && !(v.video_title || "").includes(titleFilter)) continue;
  console.log(JSON.stringify({
    video_id: v.video_id,
    title: v.video_title,
    status: v.status,
    created_at: v.created_at,
  }));
}
