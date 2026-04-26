import { Shield, Code, ChevronRight, Menu, X, Mail, ExternalLink, ShieldCheck, Server, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "-100px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

type CardItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type SolutionItem = CardItem & {
  items: string[];
};

const strengthsData: CardItem[] = [
  {
    icon: ShieldCheck,
    title: "堅牢なセキュリティ基盤",
    description: "最新の電子認証技術とゼロトラストアーキテクチャで、あらゆるサイバー脅威から企業の重要資産を守ります。",
  },
  {
    icon: Server,
    title: "スケーラブルなインフラ",
    description: "電気通信事業者として培ったノウハウで、ビジネスの成長に合わせて柔軟に拡張できるネットワーク基盤を構築します。",
  },
  {
    icon: CheckCircle2,
    title: "ワンストップサポート",
    description: "設計・構築から運用・保守まで一貫して対応。専門チームが導入後も継続的にサポートします。",
  },
];

const solutionData: SolutionItem[] = [
  {
    icon: Server,
    title: "通信インフラ",
    description: "電気通信事業法に基づく確かな電気通信事業を展開。コンピュータシステムおよび通信ネットワークのインフラ構築、設計、コンサルティングを提供します。",
    items: ["電気通信事業", "インフラ構築・設計", "ネットワークコンサルティング"],
  },
  {
    icon: ShieldCheck,
    title: "認証ソリューション",
    description: "次世代の電子認証システムの企画、開発、運用及び保守。セキュアでシームレスな接続環境を実現します。",
    items: ["電子認証システム開発", "セキュリティ保守運用"],
  },
  {
    icon: Code,
    title: "システム開発",
    description: "情報通信システム機器・ソフトウェアの製造、販売。インターネットを利用した情報提供サービスや、先進的なアプリケーションの制作・運営を行います。",
    items: ["ソフトウェア製造・販売", "アプリ制作・運営", "情報提供サービス"],
  },
];

const companyInfo = [
  { label: "社名", value: "山田ラボ合同会社（Yamada Lab LLC）\n法人番号：2290003018208" },
  { label: "設立年月日", value: "2026年3月23日" },
  { label: "代表社員", value: "山田 正樹" },
  { label: "所在地", value: "〒812-0011\n福岡県福岡市博多区博多駅前1丁目23番2号\nParkFront博多駅前1丁目5F-B" },
  { label: "許認可", value: "届出電気通信事業者（H-08-02113）" },
];

function StrengthCard({ data, delay }: { data: CardItem; delay: number }) {
  const { ref, isInView } = useInView();
  const Icon = data.icon;
  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
      style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold mb-2 text-slate-900">{data.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
    </div>
  );
}

function SolutionCard({ data, delay }: { data: SolutionItem; delay: number }) {
  const { ref, isInView } = useInView();
  const Icon = data.icon;
  return (
    <div
      ref={ref}
      className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
      style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 group-hover:border-blue-500 transition-colors">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900">{data.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6">{data.description}</p>
      <ul className="space-y-2 text-sm text-slate-500">
        {data.items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const strengthsHeading = useInView();
  const solutionsHeading = useInView();
  const companyText = useInView();
  const companyImage = useInView();
  const contact = useInView();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200 overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-4" : "bg-white/80 backdrop-blur-sm border-b border-slate-100 py-6"}`}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">山田ラボ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <button onClick={() => scrollTo('strengths')} className="hover:text-blue-600 transition-colors">特長</button>
            <button onClick={() => scrollTo('solutions')} className="hover:text-blue-600 transition-colors">事業内容</button>
            <button onClick={() => scrollTo('company')} className="hover:text-blue-600 transition-colors">会社概要</button>
            <button onClick={() => scrollTo('contact')} className="px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">お問い合わせ</button>
          </div>
          <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-4 text-sm font-medium text-slate-700">
              <button onClick={() => { setMobileMenuOpen(false); scrollTo('strengths'); }} className="py-2 text-left hover:text-blue-600 transition-colors">特長</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollTo('solutions'); }} className="py-2 text-left hover:text-blue-600 transition-colors">事業内容</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollTo('company'); }} className="py-2 text-left hover:text-blue-600 transition-colors">会社概要</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollTo('contact'); }} className="py-2 text-left text-blue-600">お問い合わせ</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-b from-blue-50/60 to-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s ease-out, transform 0.8s ease-out" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium mb-8">
              <ShieldCheck className="w-4 h-4" />
              セキュアなネットワーク・認証ソリューション
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">ネットワーク</span>で、<br />
              ビジネスの未来を拓く。
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              通信インフラの構築から認証・セキュリティまで、<br className="hidden md:block" />
              高度なネットワークソリューションで企業の課題を解決します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => scrollTo('solutions')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                事業内容を見る
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo('contact')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium transition-all flex items-center justify-center gap-2 shadow-sm">
                お問い合わせ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section id="strengths" className="py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div
            ref={strengthsHeading.ref}
            className="mb-12 md:mb-16 text-center"
            style={{ opacity: strengthsHeading.isInView ? 1 : 0, transform: strengthsHeading.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">山田ラボが選ばれる理由</h2>
            <p className="text-slate-600 max-w-xl mx-auto">ネットワーク・セキュリティの専門知識と電気通信事業者としての実績で、企業のデジタル基盤を支えます。</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {strengthsData.map((data, i) => (
              <StrengthCard key={data.title} data={data} delay={0.1 * (i + 1)} />
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 border-t border-slate-200 relative bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
          <div
            ref={solutionsHeading.ref}
            className="mb-12 md:mb-16 text-center md:text-left"
            style={{ opacity: solutionsHeading.isInView ? 1 : 0, transform: solutionsHeading.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">事業内容</h2>
            <p className="text-slate-600 max-w-2xl mx-auto md:mx-0">高度なセキュリティと利便性を両立する、次世代のネットワークインフラストラクチャを構築します。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {solutionData.map((data, i) => (
              <SolutionCard key={data.title} data={data} delay={0.1 * (i + 1)} />
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section id="company" className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              ref={companyText.ref}
              style={{ opacity: companyText.isInView ? 1 : 0, transform: companyText.isInView ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900">会社概要</h2>
              <dl className="space-y-6">
                {companyInfo.map(({ label, value }) => (
                  <div key={label} className="flex flex-col border-b border-slate-200 pb-6">
                    <dt className="text-sm text-slate-500 mb-2">{label}</dt>
                    <dd className="text-lg font-medium leading-relaxed whitespace-pre-line text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div
              ref={companyImage.ref}
              className="relative rounded-3xl overflow-hidden border border-slate-200 aspect-square md:aspect-[4/3] bg-slate-100 shadow-sm"
              style={{ opacity: companyImage.isInView ? 1 : 0, transform: companyImage.isInView ? "scale(1)" : "scale(0.95)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
            >
              <iframe
                title="会社所在地"
                src="https://www.google.com/maps?q=福岡県福岡市博多区博多駅前1丁目23番2号&output=embed"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 border-t border-slate-200 relative overflow-hidden bg-white">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
          <div
            ref={contact.ref}
            className="max-w-2xl mx-auto text-center"
            style={{ opacity: contact.isInView ? 1 : 0, transform: contact.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">お問い合わせ</h2>
            <p className="text-slate-600 mb-10">ネットワーク・セキュリティに関するご相談はお気軽にご連絡ください。</p>
            <a
              href="mailto:contact@yamada-lab.co.jp"
              className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all group max-w-md mx-auto"
            >
              <Mail className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-slate-700 font-medium">contact@yamada-lab.co.jp</span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors ml-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-slate-700">山田ラボ</span>
          </div>
          <div className="flex flex-row items-center gap-3 text-sm text-slate-600">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors whitespace-nowrap">プライバシーポリシー</Link>
            <span className="text-slate-300">|</span>
            <p className="text-slate-500 whitespace-nowrap">&copy; {new Date().getFullYear()} 山田ラボ合同会社</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
