import { Shield, ChevronLeft, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type ReactElement } from "react";

// ---- Type definitions ----

type Severity = "info" | "warning" | "critical";
type Status = "investigating" | "identified" | "monitoring" | "resolved";

type TimelineEntry = {
  at: string;
  status?: Status;
  body: string;
};

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
  updates?: TimelineEntry[];  // legacy compat
  contact: string | { email: string; form_url?: string };
};

// ---- Badge helpers ----

const severityBadge: Record<Severity, { cls: string; label: string }> = {
  info: { cls: "bg-blue-100 text-blue-800", label: "情報" },
  warning: { cls: "bg-amber-100 text-amber-800", label: "警告" },
  critical: { cls: "bg-red-100 text-red-800", label: "重大" },
};

const statusBadge: Record<Status, { cls: string; label: string }> = {
  investigating: { cls: "bg-slate-100 text-slate-700", label: "調査中" },
  identified: { cls: "bg-slate-100 text-slate-700", label: "原因特定" },
  monitoring: { cls: "bg-slate-100 text-slate-700", label: "経過監視" },
  resolved: { cls: "bg-green-100 text-green-800", label: "復旧済み" },
};

const severityIcon: Record<Severity, ReactElement> = {
  info: <Info className="w-4 h-4" aria-hidden="true" />,
  warning: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
  critical: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
};

// ---- Date formatting ----

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    }) + " JST";
  } catch {
    return iso;
  }
}

// ---- Component ----

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    setNotFound(false);
    setIncident(null);

    fetch("/notice/incidents.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Incident[]>;
      })
      .then((data) => {
        if (cancelled) return;
        const found = data.find((item) => item.id === id);
        if (found) {
          setIncident(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Timeline: prefer `timeline`, fall back to `updates`
  const timelineEntries: TimelineEntry[] =
    incident?.timeline ?? incident?.updates ?? [];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 py-7">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-slate-900">山田ラボ</span>
          </div>
          <Link
            to="/notice"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors focus:outline-2 focus:outline-blue-500"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            障害情報一覧へ戻る
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">

        {/* Breadcrumb */}
        <nav aria-label="パンくずリスト" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500">
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors focus:outline-2 focus:outline-blue-500">
                トップ
              </Link>
            </li>
            <li aria-hidden="true">&rsaquo;</li>
            <li>
              <Link to="/notice" className="hover:text-blue-600 transition-colors focus:outline-2 focus:outline-blue-500">
                障害情報
              </Link>
            </li>
            {incident && (
              <>
                <li aria-hidden="true">&rsaquo;</li>
                <li className="text-slate-700 truncate max-w-xs" aria-current="page">
                  {incident.title}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Error state */}
        {loadError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" aria-hidden="true" />
            <p className="text-slate-700 font-medium">障害情報の読み込みに失敗しました。</p>
            <p className="text-sm text-slate-500">しばらく待ってからページを再読み込みしてください。</p>
          </div>
        )}

        {/* Not found state */}
        {notFound && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center space-y-4">
            <p className="text-slate-700 font-medium">指定された障害情報は存在しません。</p>
            <Link
              to="/notice"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline focus:outline-2 focus:outline-blue-500"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              障害情報一覧へ
            </Link>
          </div>
        )}

        {/* Incident detail */}
        {incident && (
          <div className="space-y-10">

            {/* Top card: badges + title + meta */}
            <section aria-labelledby="incident-title">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${severityBadge[incident.severity].cls}`}
                >
                  {severityIcon[incident.severity]}
                  {severityBadge[incident.severity].label}
                </span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[incident.status].cls}`}
                >
                  {statusBadge[incident.status].label}
                </span>
              </div>

              <h1
                id="incident-title"
                className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-snug"
              >
                {incident.title}
              </h1>

              {/* Meta info */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 text-sm">

                {/* started_at */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-slate-500 min-w-[5rem]">発生日時</span>
                  <time dateTime={incident.started_at} className="text-slate-800 font-medium">
                    {formatDateTime(incident.started_at)}
                  </time>
                </div>

                {/* resolved_at */}
                {incident.resolved_at && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-slate-500 min-w-[5rem]">復旧日時</span>
                    <time dateTime={incident.resolved_at} className="text-slate-800 font-medium">
                      {formatDateTime(incident.resolved_at)}
                    </time>
                  </div>
                )}

                {/* affected_services */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                  <span className="text-slate-500 min-w-[5rem] pt-0.5">影響サービス</span>
                  <div className="flex flex-wrap gap-1.5">
                    {incident.affected_services.map((svc) => (
                      <span
                        key={svc}
                        className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* Summary */}
            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="text-lg font-bold text-slate-900 mb-3">
                概要
              </h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {incident.summary}
              </div>
            </section>

            {/* Timeline */}
            {timelineEntries.length > 0 && (
              <section aria-labelledby="timeline-heading">
                <h2 id="timeline-heading" className="text-lg font-bold text-slate-900 mb-5">
                  タイムライン
                </h2>
                <ol className="border-l-2 border-slate-200 pl-6 space-y-6">
                  {timelineEntries.map((entry, idx) => (
                    <li key={idx} className="relative">
                      {/* dot on the border */}
                      <span
                        className="absolute -left-[1.625rem] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"
                        aria-hidden="true"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <time
                            dateTime={entry.at}
                            className="text-sm text-slate-500 font-mono"
                          >
                            {formatDateTime(entry.at)}
                          </time>
                          {entry.status && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[entry.status].cls}`}
                            >
                              {statusBadge[entry.status].label}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{entry.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Contact */}
            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-lg font-bold text-slate-900 mb-3">
                お問い合わせ
              </h2>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2 text-sm text-slate-700">
                {typeof incident.contact === "string" ? (
                  <p>
                    <a
                      href={`mailto:${incident.contact}`}
                      className="text-blue-600 hover:underline focus:outline-2 focus:outline-blue-500"
                    >
                      {incident.contact}
                    </a>
                  </p>
                ) : (
                  <>
                    <p>
                      メール:{" "}
                      <a
                        href={`mailto:${incident.contact.email}`}
                        className="text-blue-600 hover:underline focus:outline-2 focus:outline-blue-500"
                      >
                        {incident.contact.email}
                      </a>
                    </p>
                    {incident.contact.form_url && (
                      <p>
                        お問い合わせフォーム:{" "}
                        <a
                          href={incident.contact.form_url}
                          className="text-blue-600 hover:underline focus:outline-2 focus:outline-blue-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {incident.contact.form_url}
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Back link */}
            <div className="pt-2">
              <Link
                to="/notice"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline focus:outline-2 focus:outline-blue-500"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                障害情報一覧へ戻る
              </Link>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight text-slate-700">山田ラボ</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-slate-600">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors focus:outline-2 focus:outline-blue-500">
              プライバシーポリシー
            </Link>
            <Link to="/notice" className="hover:text-blue-600 transition-colors focus:outline-2 focus:outline-blue-500">
              障害情報
            </Link>
            <p className="text-slate-500">&copy; {new Date().getFullYear()} 山田ラボ合同会社</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
