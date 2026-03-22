import { Shield, Wifi, Code, ChevronRight, Lock, Menu, X, Mail, ExternalLink, LucideIcon } from "lucide-react";
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

type SolutionItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  items: string[];
};

const solutionData: SolutionItem[] = [
  {
    icon: Wifi,
    title: "通信インフラ",
    description: "電気通信事業法に基づく確かな電気通信事業を展開。コンピュータシステムおよび通信ネットワークのインフラ構築、設計、コンサルティングを提供します。",
    items: ["電気通信事業", "インフラ構築・設計", "ネットワークコンサルティング"],
  },
  {
    icon: Lock,
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

function SolutionCard({ data, delay }: { data: SolutionItem; delay: number }) {
  const { ref, isInView } = useInView();
  const Icon = data.icon;
  return (
    <div
      ref={ref}
      className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
      style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
        <Icon className="w-7 h-7 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold mb-4">{data.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{data.description}</p>
      <ul className="space-y-2 text-sm text-slate-500">
        {data.items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const solutionsHeading = useInView();
  const companyText = useInView();
  const companyImage = useInView();
  const contact = useInView();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold tracking-tight">山田ラボ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solutions" className="hover:text-blue-400 transition-colors">事業内容</a>
            <a href="#company" className="hover:text-blue-400 transition-colors">会社概要</a>
            <a href="#contact" className="px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">お問い合わせ</a>
          </div>
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 text-sm font-medium text-slate-300">
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-400 transition-colors">事業内容</a>
              <a href="#company" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-400 transition-colors">会社概要</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 text-blue-400">お問い合わせ</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <div
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s ease-out, transform 0.8s ease-out" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">ネットワーク</span>で未来をつなぐ。
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              次世代の通信インフラとセキュアなネットワーク基盤により、<br className="hidden md:block" />
              国境を越えたシームレスな通信体験を提供します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#solutions" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                事業内容を見る
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Business Solutions */}
      <section id="solutions" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div
            ref={solutionsHeading.ref}
            className="mb-16 md:mb-24 text-center md:text-left"
            style={{ opacity: solutionsHeading.isInView ? 1 : 0, transform: solutionsHeading.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">事業内容</h2>
            <p className="text-slate-400 max-w-2xl mx-auto md:mx-0">高度なセキュリティと利便性を両立する、次世代のインフラストラクチャを構築します。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {solutionData.map((data, i) => (
              <SolutionCard key={data.title} data={data} delay={0.1 * (i + 1)} />
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section id="company" className="py-32 bg-slate-900/50 border-t border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              ref={companyText.ref}
              style={{ opacity: companyText.isInView ? 1 : 0, transform: companyText.isInView ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12">会社概要</h2>
              <div className="space-y-8">
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2">社名</span>
                  <span className="text-lg font-medium">山田ラボ合同会社 (Yamada Lab LLC)</span>
                </div>
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2">代表社員</span>
                  <span className="text-lg font-medium">山田 正樹</span>
                </div>
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2">所在地</span>
                  <span className="text-lg font-medium leading-relaxed">
                    〒812-0011<br />
                    福岡県福岡市博多区博多駅前1丁目23番2号<br />
                    ParkFront博多駅前1丁目5F-B
                  </span>
                </div>
              </div>
            </div>

            <div
              ref={companyImage.ref}
              className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square md:aspect-[4/3] bg-slate-800"
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
      <section id="contact" className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div
            ref={contact.ref}
            className="max-w-2xl mx-auto text-center"
            style={{ opacity: contact.isInView ? 1 : 0, transform: contact.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">お問い合わせ</h2>
            <p className="text-slate-400 mb-12">お問い合わせはメールにてお気軽にご連絡ください。</p>
            <a
              href="mailto:contact@yamada-lab.co.jp"
              className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group"
            >
              <Mail className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-medium">contact@yamada-lab.co.jp</span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors ml-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold tracking-tight text-slate-300">山田ラボ</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} 山田ラボ合同会社 All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
