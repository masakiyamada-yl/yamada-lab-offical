/**
 * build-notice.ts
 *
 * corp site `/notice` 障害情報公知ページの prebuild step。
 * `content/notice/incidents/*.yaml` を読み込み、schema 検証 + 機密検出を行い、
 * `public/notice/incidents.json` および `public/notice/feed.xml` (Atom 1.0) を生成する。
 * (vite が public/* を dist/* に copy through するため、dev/prod 双方で動く)
 *
 * 設計書: docs/notice-page-design-v0.1.md §4 / §7
 * 実行: `tsx scripts/build-notice.ts` （npm run prebuild から呼ぶ前提）
 *
 * REQUIRES: npm i -D yaml tsx
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';

// --- 定数 ----------------------------------------------------------------

const CONTENT_DIR = path.resolve(process.cwd(), 'content/notice/incidents');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/notice');
const SITE_BASE = 'https://yamada-lab.co.jp';
const FEED_SELF_URL = `${SITE_BASE}/notice/feed.xml`;
const FEED_ALTERNATE_URL = `${SITE_BASE}/#/notice`;
const FEED_TITLE = '山田ラボ 障害情報';
const FEED_ID = `${SITE_BASE}/notice/`; // tag-style 不要、URL を id にする（Atom 1.0 許容）

// id 書式: 設計 §4.3 は `^incident-\d{8}-\d{2}$` 規定だが、
// サンプル `2026-05-10-001-sample.yaml` 互換のため後者書式も許可する（互換ルール）
const ID_PATTERN_NEW = /^incident-\d{8}-\d{2}$/;
const ID_PATTERN_LEGACY = /^\d{4}-\d{2}-\d{2}-\d{3}(-[a-z0-9-]+)?$/;

const SEVERITY_ENUM = ['info', 'warning', 'critical'] as const;
const STATUS_ENUM = ['investigating', 'identified', 'monitoring', 'resolved'] as const;

type Severity = (typeof SEVERITY_ENUM)[number];
type Status = (typeof STATUS_ENUM)[number];

interface TimelineEntry {
  at: string;
  status?: string;
  body: string;
}

interface ContactObject {
  email: string;
  form_url?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  affected_services: string[];
  started_at: string;
  resolved_at?: string;
  summary: string;
  timeline: TimelineEntry[];
  contact: ContactObject | string;
  related_links?: string[];
}

// --- 機密検出パターン (設計 §7.1) -----------------------------------------
//
// 各 pattern は description で fail メッセージに利用される。
// メールは「yamada-lab.co.jp 以外」のみ拒否（社内代表アドレスは記載許容）。

// SECRET_PATTERNS は generic な汎用パターンのみソースで保持する。
// 内部命名規則 (service 名・社内 channel 等) は PUBLIC リポでの語彙列挙それ自体が
// 内部規約を漏らすため、`.secret-patterns.json` から override で読み込む（PRIVATE 配布）。
// 仕組み:
//   1. ソース既定 = DEFAULT_PATTERNS (汎用、語彙列挙なし)
//   2. SECRET_PATTERNS_FILE 環境変数 (default: `.secret-patterns.json`) を見て
//      存在すれば追加パターンを merge する
//   3. JSON 形式: [{ "name": "...", "pattern": "regex string", "flags": "i" }]
//
// 参考: audit #012 (2026-05-14) / feedback_public_repo_threat_model.md

interface SecretPatternEntry {
  name: string;
  pattern: RegExp;
}
interface SecretPatternJson {
  name: string;
  pattern: string;
  flags?: string;
}

const DEFAULT_PATTERNS: SecretPatternEntry[] = [
  {
    name: '外部メールアドレス (yamada-lab.co.jp 以外)',
    pattern: /[A-Za-z0-9._%+-]+@(?!yamada-lab\.co\.jp\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  },
  {
    name: 'MAC アドレス',
    pattern: /([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/,
  },
  {
    name: '内部 IP (RFC1918)',
    pattern: /\b(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/,
  },
  {
    name: 'Google API key',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
  },
  {
    name: '秘密鍵ヘッダ',
    pattern: /-----BEGIN/,
  },
  {
    name: 'password 直書き',
    pattern: /password\s*[:=]/i,
  },
];

function loadOverridePatterns(): SecretPatternEntry[] {
  const filePath = process.env.SECRET_PATTERNS_FILE
    || path.resolve(process.cwd(), '.secret-patterns.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SecretPatternJson[];
    if (!Array.isArray(raw)) {
      console.warn(`[build-notice] ${filePath}: top-level must be an array, ignoring`);
      return [];
    }
    return raw.map((e) => ({
      name: e.name,
      pattern: new RegExp(e.pattern, e.flags ?? ''),
    }));
  } catch (err) {
    console.warn(`[build-notice] failed to parse ${filePath}: ${(err as Error).message}, ignoring`);
    return [];
  }
}

const SECRET_PATTERNS: SecretPatternEntry[] = [
  ...DEFAULT_PATTERNS,
  ...loadOverridePatterns(),
];

// --- 検証ロジック ---------------------------------------------------------

class ValidationError extends Error {
  constructor(public file: string, public field: string, message: string) {
    super(`[${path.basename(file)}] ${field}: ${message}`);
  }
}

function isISO8601WithOffset(s: string): boolean {
  // ISO8601 + offset 必須（`Z` または `+09:00` 等）。`Date.parse` 成功も併せて確認。
  if (typeof s !== 'string') return false;
  if (Number.isNaN(Date.parse(s))) return false;
  // offset 部分を厳密にチェック（末尾が Z または ±HH:MM）
  return /([Zz]|[+-]\d{2}:\d{2})$/.test(s);
}

function validateIncident(file: string, raw: unknown): Incident {
  const baseName = path.basename(file, '.yaml');

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ValidationError(file, '(root)', 'YAML の最上位はオブジェクトでなければなりません');
  }
  const o = raw as Record<string, unknown>;

  // id
  if (typeof o.id !== 'string') {
    throw new ValidationError(file, 'id', '必須・文字列');
  }
  if (!ID_PATTERN_NEW.test(o.id) && !ID_PATTERN_LEGACY.test(o.id)) {
    throw new ValidationError(
      file,
      'id',
      `書式が不正です: '${o.id}'. 期待: 'incident-YYYYMMDD-NN' または 'YYYY-MM-DD-NNN(-suffix)?'`,
    );
  }
  if (o.id !== baseName) {
    throw new ValidationError(file, 'id', `ファイル名 (${baseName}) と一致しません: '${o.id}'`);
  }

  // title
  if (typeof o.title !== 'string' || o.title.length === 0) {
    throw new ValidationError(file, 'title', '必須・空文字列不可');
  }
  if (o.title.length > 100) {
    throw new ValidationError(file, 'title', `100 文字以内必須 (現: ${o.title.length})`);
  }

  // severity
  if (!SEVERITY_ENUM.includes(o.severity as Severity)) {
    throw new ValidationError(
      file,
      'severity',
      `enum 違反: '${String(o.severity)}'. 許可: ${SEVERITY_ENUM.join(' / ')}`,
    );
  }

  // status
  if (!STATUS_ENUM.includes(o.status as Status)) {
    throw new ValidationError(
      file,
      'status',
      `enum 違反: '${String(o.status)}'. 許可: ${STATUS_ENUM.join(' / ')}`,
    );
  }

  // affected_services
  if (!Array.isArray(o.affected_services) || o.affected_services.length === 0) {
    throw new ValidationError(file, 'affected_services', '必須・1 要素以上の配列');
  }
  for (const [i, s] of o.affected_services.entries()) {
    if (typeof s !== 'string' || s.length === 0) {
      throw new ValidationError(file, `affected_services[${i}]`, '空でない文字列必須');
    }
  }

  // started_at
  if (typeof o.started_at !== 'string' || !isISO8601WithOffset(o.started_at)) {
    throw new ValidationError(file, 'started_at', '必須・ISO8601 + offset (例: 2026-05-10T09:15:00+09:00)');
  }
  const startedMs = Date.parse(o.started_at);

  // resolved_at
  let resolvedMs: number | undefined;
  if (o.status === 'resolved') {
    if (typeof o.resolved_at !== 'string' || !isISO8601WithOffset(o.resolved_at)) {
      throw new ValidationError(file, 'resolved_at', 'status=resolved のとき必須・ISO8601 + offset');
    }
    resolvedMs = Date.parse(o.resolved_at);
    if (resolvedMs < startedMs) {
      throw new ValidationError(file, 'resolved_at', `started_at より過去の時刻は不可: ${o.resolved_at} < ${o.started_at}`);
    }
  } else if (o.resolved_at !== undefined) {
    if (typeof o.resolved_at !== 'string' || !isISO8601WithOffset(o.resolved_at)) {
      throw new ValidationError(file, 'resolved_at', 'ISO8601 + offset 形式が必要');
    }
  }

  // summary
  if (typeof o.summary !== 'string' || o.summary.length === 0) {
    throw new ValidationError(file, 'summary', '必須・空文字列不可');
  }
  if (o.summary.length > 200) {
    throw new ValidationError(file, 'summary', `200 文字以内必須 (現: ${o.summary.length})`);
  }

  // timeline / updates （updates は legacy 互換）
  const timelineRaw = (o.timeline ?? o.updates) as unknown;
  if (!Array.isArray(timelineRaw) || timelineRaw.length === 0) {
    throw new ValidationError(file, 'timeline', '必須・1 要素以上 (timeline または updates)');
  }
  const timeline: TimelineEntry[] = [];
  let prevAtMs = -Infinity;
  for (const [i, entry] of timelineRaw.entries()) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ValidationError(file, `timeline[${i}]`, 'object でなければなりません');
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.at !== 'string' || !isISO8601WithOffset(e.at)) {
      throw new ValidationError(file, `timeline[${i}].at`, 'ISO8601 + offset 必須');
    }
    if (typeof e.body !== 'string' || e.body.length === 0) {
      throw new ValidationError(file, `timeline[${i}].body`, '必須・空文字列不可');
    }
    const atMs = Date.parse(e.at);
    if (atMs < prevAtMs) {
      throw new ValidationError(file, `timeline[${i}].at`, `昇順違反: 前エントリより過去 (${e.at})`);
    }
    prevAtMs = atMs;
    timeline.push({
      at: e.at,
      status: typeof e.status === 'string' ? e.status : undefined,
      body: e.body,
    });
  }

  // contact: object {email, form_url?} または string (legacy 互換)
  let contact: ContactObject | string;
  if (typeof o.contact === 'string' && o.contact.length > 0) {
    contact = o.contact;
  } else if (o.contact !== null && typeof o.contact === 'object' && !Array.isArray(o.contact)) {
    const c = o.contact as Record<string, unknown>;
    if (typeof c.email !== 'string' || c.email.length === 0) {
      throw new ValidationError(file, 'contact.email', '必須・空文字列不可');
    }
    contact = {
      email: c.email,
      form_url: typeof c.form_url === 'string' ? c.form_url : undefined,
    };
  } else {
    throw new ValidationError(file, 'contact', '必須・object {email, form_url?} または string');
  }

  // related_links (任意)
  let relatedLinks: string[] | undefined;
  if (o.related_links !== undefined) {
    if (!Array.isArray(o.related_links)) {
      throw new ValidationError(file, 'related_links', '配列でなければなりません');
    }
    for (const [i, s] of o.related_links.entries()) {
      if (typeof s !== 'string') {
        throw new ValidationError(file, `related_links[${i}]`, '文字列必須');
      }
    }
    relatedLinks = o.related_links as string[];
  }

  return {
    id: o.id,
    title: o.title,
    severity: o.severity as Severity,
    status: o.status as Status,
    affected_services: o.affected_services as string[],
    started_at: o.started_at,
    resolved_at: typeof o.resolved_at === 'string' ? o.resolved_at : undefined,
    summary: o.summary,
    timeline,
    contact,
    related_links: relatedLinks,
  };
}

/**
 * 機密検出 (§7.1)。raw な YAML 文字列に対して全パターンを照合。
 * YAML パース後ではなく原文に当てるのは、コメント等にも機密が混入しうるため。
 */
function detectSecrets(file: string, rawText: string): string[] {
  const findings: string[] = [];
  for (const { name, pattern } of SECRET_PATTERNS) {
    const m = rawText.match(pattern);
    if (m) {
      // マッチ位置の行番号を算出（fail メッセージで開発者が探しやすいように）
      const lineNo = rawText.slice(0, m.index ?? 0).split('\n').length;
      findings.push(`[${path.basename(file)}:${lineNo}] 機密パターン検出 (${name}): '${m[0]}'`);
    }
  }
  return findings;
}

// --- 出力生成 ------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTimelineHtml(timeline: TimelineEntry[]): string {
  // Atom <content> 用に timeline を簡易 HTML 化（XHTML ではなく escaped HTML として埋める）
  const items = timeline
    .map(
      (t) =>
        `<li><strong>${escapeHtml(t.at)}</strong>` +
        (t.status ? ` [${escapeHtml(t.status)}]` : '') +
        `: ${escapeHtml(t.body)}</li>`,
    )
    .join('');
  return `<ul>${items}</ul>`;
}

function buildAtomFeed(incidents: Incident[]): string {
  // feed updated は最新 entry の updated を採用、空ならビルド時刻
  const feedUpdated =
    incidents.length > 0
      ? new Date(
          Math.max(
            ...incidents.map((i) => Date.parse(i.timeline[i.timeline.length - 1].at)),
          ),
        ).toISOString()
      : new Date().toISOString();

  const entries = incidents
    .map((inc) => {
      const lastAt = inc.timeline[inc.timeline.length - 1].at;
      const updated = new Date(Date.parse(lastAt)).toISOString();
      const published = new Date(Date.parse(inc.started_at)).toISOString();
      const entryUrl = `${SITE_BASE}/#/notice/${inc.id}`;
      const contentHtml = renderTimelineHtml(inc.timeline);
      return [
        '  <entry>',
        `    <id>${escapeXml(entryUrl)}</id>`,
        `    <title>${escapeXml(inc.title)}</title>`,
        `    <link rel="alternate" type="text/html" href="${escapeXml(entryUrl)}" />`,
        `    <published>${published}</published>`,
        `    <updated>${updated}</updated>`,
        `    <summary>${escapeXml(inc.summary)}</summary>`,
        `    <content type="html">${escapeXml(contentHtml)}</content>`,
        '  </entry>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${escapeXml(FEED_ID)}</id>`,
    `  <title>${escapeXml(FEED_TITLE)}</title>`,
    `  <updated>${feedUpdated}</updated>`,
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(FEED_SELF_URL)}" />`,
    `  <link rel="alternate" type="text/html" href="${escapeXml(FEED_ALTERNATE_URL)}" />`,
    entries,
    '</feed>',
    '',
  ].join('\n');
}

// --- main ---------------------------------------------------------------

function main(): void {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`[build-notice] CONTENT_DIR not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => path.join(CONTENT_DIR, f));

  const errors: string[] = [];
  const incidents: Incident[] = [];
  const seenIds = new Set<string>();

  for (const file of files) {
    let rawText: string;
    try {
      rawText = fs.readFileSync(file, 'utf8');
    } catch (e) {
      errors.push(`[${path.basename(file)}] read error: ${(e as Error).message}`);
      continue;
    }

    // 機密検出（パース前に原文に対して実施）
    const secretFindings = detectSecrets(file, rawText);
    errors.push(...secretFindings);

    // YAML パース
    let parsed: unknown;
    try {
      parsed = parse(rawText);
    } catch (e) {
      errors.push(`[${path.basename(file)}] YAML parse error: ${(e as Error).message}`);
      continue;
    }

    // schema 検証
    try {
      const inc = validateIncident(file, parsed);
      if (seenIds.has(inc.id)) {
        errors.push(`[${path.basename(file)}] id 重複: '${inc.id}' は別ファイルで既出`);
      } else {
        seenIds.add(inc.id);
        incidents.push(inc);
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        errors.push(e.message);
      } else {
        errors.push(`[${path.basename(file)}] unexpected: ${(e as Error).message}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('[build-notice] 検証 NG:');
    for (const m of errors) console.error('  - ' + m);
    console.error(`[build-notice] ${errors.length} 件のエラーで build を中止します。`);
    process.exit(1);
  }

  // started_at 降順 sort
  incidents.sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at));

  // 出力ディレクトリ作成
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // incidents.json
  const jsonPath = path.join(OUTPUT_DIR, 'incidents.json');
  fs.writeFileSync(jsonPath, JSON.stringify(incidents, null, 2) + '\n', 'utf8');

  // feed.xml
  const feedPath = path.join(OUTPUT_DIR, 'feed.xml');
  fs.writeFileSync(feedPath, buildAtomFeed(incidents), 'utf8');

  console.log(`[build-notice] OK: ${incidents.length} incident(s) → ${jsonPath}, ${feedPath}`);
}

main();

// REQUIRES: npm i -D yaml tsx
