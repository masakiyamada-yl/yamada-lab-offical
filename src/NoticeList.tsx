import { Shield, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// ---- 型定義 ----
type Severity = 'info' | 'warning' | 'critical';
type Status = 'investigating' | 'identified' | 'monitoring' | 'resolved';
type TimelineEntry = { at: string; status?: Status; body: string };
type Incident = {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  affected_services: string[];
  started_at: string;
  resolved_at?: string;
  summary: string;
  timeline?: TimelineEntry[];
  updates?: TimelineEntry[];  // legacy 互換
  contact: string | { email: string; form_url?: string };
};

// ---- バッジスタイル ----
const severityClass: Record<Severity, string> = {
  info:     'bg-blue-100 text-blue-800',
  warning:  'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

const severityLabel: Record<Severity, string> = {
  info:     '情報',
  warning:  '警告',
  critical: '重大',
};

const statusClass: Record<Status, string> = {
  investigating: 'bg-slate-100 text-slate-700',
  identified:    'bg-slate-100 text-slate-700',
  monitoring:    'bg-slate-100 text-slate-700',
  resolved:      'bg-green-100 text-green-800',
};

const statusLabel: Record<Status, string> = {
  investigating: '調査中',
  identified:    '原因特定',
  monitoring:    '監視中',
  resolved:      '解決済み',
};

// ---- 日時整形 (YYYY-MM-DD HH:MM JST) ----
function formatJST(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const jst = new Date(d.getTime() + (9 * 60 - d.getTimezoneOffset()) * 60_000);
  const yyyy = jst.getUTCFullYear();
  const mm   = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(jst.getUTCDate()).padStart(2, '0');
  const hh   = String(jst.getUTCHours()).padStart(2, '0');
  const min  = String(jst.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} JST`;
}

// ---- 影響サービス整形 ----
const MAX_SERVICES = 3;
function formatServices(services: string[]): string {
  if (services.length === 0) return '';
  if (services.length <= MAX_SERVICES) return services.join(', ');
  return services.slice(0, MAX_SERVICES).join(', ') + ` 他${services.length - MAX_SERVICES}件`;
}

// ---- コンポーネント ----
export default function NoticeList() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/notice/incidents.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Incident[]>;
      })
      .then((data) => setIncidents(data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 py-7">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">山田ラボ</span>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            トップへ戻る
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900">障害情報</h1>
        <p className="text-sm text-slate-500 mb-10">山田ラボのサービスに関する障害・メンテナンス情報を掲載しています。</p>

        {/* エラー */}
        {error && (
          <p className="text-slate-600 text-sm">
            障害情報の読み込みに失敗しました。時間を置いて再度お試しください。
          </p>
        )}

        {/* ローディング */}
        {!error && incidents === null && (
          <p className="text-slate-400 text-sm">読み込み中...</p>
        )}

        {/* 空状態 */}
        {!error && incidents !== null && incidents.length === 0 && (
          <p className="text-slate-600 text-sm">現在公開中の障害情報はありません。</p>
        )}

        {/* 一覧 */}
        {!error && incidents !== null && incidents.length > 0 && (
          <ul className="space-y-4">
            {incidents.map((inc) => (
              <li key={inc.id}>
                <Link
                  to={`/notice/${inc.id}`}
                  className="block border border-slate-200 rounded-lg p-5 hover:bg-slate-50 transition"
                >
                  {/* バッジ行 */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityClass[inc.severity]}`}>
                      {severityLabel[inc.severity]}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass[inc.status]}`}>
                      {statusLabel[inc.status]}
                    </span>
                  </div>

                  {/* タイトル */}
                  <p className="text-base font-semibold text-slate-900 leading-snug mb-1.5">
                    {inc.title}
                  </p>

                  {/* メタ情報 */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{formatJST(inc.started_at)}</span>
                    {inc.affected_services.length > 0 && (
                      <span className="truncate max-w-xs">
                        影響サービス: {formatServices(inc.affected_services)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-slate-700">山田ラボ</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1 text-sm text-slate-600">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">プライバシーポリシー</Link>
            <p className="text-slate-500">&copy; {new Date().getFullYear()} 山田ラボ合同会社</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
