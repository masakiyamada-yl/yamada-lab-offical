#!/usr/bin/env node
/**
 * run-axe.mjs
 *
 * `npm run build` 後の dist を vite preview で配信し、@axe-core/cli でアクセシビリティ検証を行う。
 * Phase B (corp site §6.14 障害情報公知ページの WCAG 検証) で導入。
 *
 * 対象 URL:
 *   - /          (トップ)
 *   - /#/notice  (障害情報一覧)
 *   - /#/privacy (プライバシーポリシー)
 *
 * 注: HashRouter のため URL は `/#/...` 形式。
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE = `http://${HOST}:${PORT}`;
const PATHS = ['/', '/#/notice', '/#/privacy'];
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

/** vite preview を spawn */
function startPreview() {
  return spawn('npx', ['vite', 'preview', '--host', HOST, '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
}

/** サーバが応答するまで待機 */
async function waitForReady(server) {
  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`vite preview exited prematurely (code=${server.exitCode})`);
    }
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // 接続失敗は無視してリトライ
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`vite preview did not become ready within ${MAX_WAIT_MS}ms`);
}

/** axe をターゲット URL 群に対して実行 */
function runAxe() {
  return new Promise((resolve) => {
    const urls = PATHS.map((p) => `${BASE}${p}`);
    const args = [
      '@axe-core/cli',
      ...urls,
      '--exit',
      '--tags', 'wcag2a,wcag2aa,wcag21a,wcag21aa',
    ];
    const proc = spawn('npx', args, { stdio: 'inherit', env: process.env });
    proc.on('exit', (code) => resolve(code ?? 1));
    proc.on('error', (err) => {
      console.error('[run-axe] failed to spawn axe:', err.message);
      resolve(1);
    });
  });
}

async function main() {
  const server = startPreview();

  let serverLog = '';
  server.stdout.on('data', (d) => { serverLog += d.toString(); });
  server.stderr.on('data', (d) => { serverLog += d.toString(); });

  const cleanup = () => {
    if (server.exitCode === null) {
      try { server.kill('SIGTERM'); } catch { /* noop */ }
    }
  };
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });

  try {
    await waitForReady(server);
  } catch (e) {
    console.error('[run-axe] server startup failed:', e.message);
    if (serverLog) console.error('[run-axe] preview log:\n' + serverLog);
    cleanup();
    process.exit(1);
  }

  const axeExit = await runAxe();
  cleanup();
  process.exit(axeExit);
}

main().catch((e) => {
  console.error('[run-axe] unexpected error:', e);
  process.exit(1);
});
