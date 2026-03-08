import { Shield, Wifi, Code, ChevronRight, Globe, Lock, Menu, X, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
      },
      { threshold: 0.1, rootMargin: "-100px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, isInView };
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 50); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbx-IftvWDli_VrQ-j8T51m9FcJq3KU3A-RdA8BK-WIe3fnj5z7LFaTlauXSYulE97cpGQ/exec", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFormStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else { setFormStatus("error"); }
    } catch { setFormStatus("error"); }
  };

  const solutions = useInView();
  const card1 = useInView();
  const card2 = useInView();
  const card3 = useInView();
  const companyText = useInView();
  const companyImage = useInView();
  const contactSection = useInView();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold tracking-tight">山田ラボ合同会社</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solutions" className="hover:text-blue-400 transition-colors">ソリューション</a>
            <a href="#company" className="hover:text-blue-400 transition-colors">会社概要</a>
            <a href="#contact" className="px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">お問い合わせ</a>
          </div>
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-slate-300">
            <a href="#solutions" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>ソリューション</a>
            <a href="#company" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>会社概要</a>
            <a href="#contact" className="text-blue-400" onClick={() => setMobileMenuOpen(false)}>お問い合わせ</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s ease-out, transform 0.8s ease-out" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-300 tracking-wide">Border Free & Security</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              世界を<br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">一つの認証</span>で繋ぐ。
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
              OpenRoaming技術と強固な認証基盤により、
              国境やネットワークの壁を越えたシームレスで安全な通信体験を提供します。
            </p>
            <a href="#solutions" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all">
              ソリューションを見る <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div ref={solutions.ref} className="mb-16 md:mb-24 text-center md:text-left"
            style={{ opacity: solutions.isInView ? 1 : 0, transform: solutions.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">事業内容</h2>
            <p className="text-slate-400 max-w-2xl mx-auto md:mx-0">高度なセキュリティと利便性を両立する、次世代のインフラストラクチャを構築します。</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div ref={card1.ref} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
              style={{ opacity: card1.isInView ? 1 : 0, transform: card1.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s" }}>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Wifi className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">通信インフラ</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">電気通信事業法に基づく確かな電気通信事業を展開。コンピュータシステムおよび通信ネットワークのインフラ構築、設計、コンサルティングを提供します。</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />電気通信事業</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />インフラ構築・設計</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />ネットワークコンサルティング</li>
              </ul>
            </div>
            <div ref={card2.ref} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
              style={{ opacity: card2.isInView ? 1 : 0, transform: card2.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s" }}>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Lock className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">認証ソリューション</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">OpenRoamingをはじめとする次世代の認証システムの企画、開発、運用及び保守。セキュアでシームレスな接続環境を実現します。</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />認証システム開発</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />OpenRoaming連携</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />セキュリティ保守運用</li>
              </ul>
            </div>
            <div ref={card3.ref} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
              style={{ opacity: card3.isInView ? 1 : 0, transform: card3.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s" }}>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Code className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">システム開発</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">情報通信システム機器・ソフトウェアの製造、販売。インターネットを利用した情報提供サービスや、先進的なアプリケーションの制作・運営を行います。</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />ソフトウェア製造・販売</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />アプリ制作・運営</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />情報提供サービス</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Company */}
      <section id="company" className="py-32 bg-slate-900/50 border-t border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div ref={companyText.ref}
              style={{ opacity: companyText.isInView ? 1 : 0, transform: companyText.isInView ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-12">会社概要</h2>
              <div className="space-y-8">
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2 uppercase tracking-wider">社名</span>
                  <span className="text-lg font-medium">山田ラボ合同会社 (Yamada Lab LLC)</span>
                </div>
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2 uppercase tracking-wider">代表社員</span>
                  <span className="text-lg font-medium">山田 正樹</span>
                </div>
                <div className="flex flex-col border-b border-white/10 pb-6">
                  <span className="text-sm text-slate-500 mb-2 uppercase tracking-wider">所在地</span>
                  <span className="text-lg font-medium leading-relaxed">
                    〒812-0011<br />
                    福岡県福岡市博多区博多駅前1丁目23番2号<br />
                    ParkFront博多駅前1丁目5F-B
                  </span>
                </div>
              </div>
            </div>
            <div ref={companyImage.ref}
              className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square md:aspect-[4/3] bg-slate-800"
              style={{ opacity: companyImage.isInView ? 1 : 0, transform: companyImage.isInView ? "scale(1)" : "scale(0.95)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <span className="font-semibold tracking-wider">GLOBAL REACH</span>
                </div>
                <p className="text-sm text-slate-400">Fukuoka, Japan to the World.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div ref={contactSection.ref}
            style={{ opacity: contactSection.isInView ? 1 : 0, transform: contactSection.isInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }}>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">お問い合わせ</h2>
              <p className="text-slate-400 text-center mb-12">
                ご質問・ご相談はお気軽にお問い合わせください。<br className="hidden md:block" />
                担当者より折り辺しご連絡いたします。
              </p>

              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                  <h3 className="text-xl font-bold">送信が完了しました</h3>
                  <p className="text-slate-400">お問い合わせありがとうございます。<br />内容を確認の上、担当者よりご連絡いたします。</p>
                  <button onClick={() => setFormStatus("idle")} className="mt-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors">
                    新しいお問い合わせ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm text-slate-400 mb-2">お名前 <span className="text-blue-400">*</span></label>
                      <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
                        placeholder="山田 太郎"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm text-slate-400 mb-2">メールアドレス <span className="text-blue-400">*</span></label>
                      <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                        placeholder="taro@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm text-slate-400 mb-2">件名 <span className="text-blue-400">*</span></label>
                    <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange}
                      placeholder="お問い合わせ内容の件名"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm text-slate-400 mb-2">メッセージ <span className="text-blue-400">*</span></label>
                    <textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange}
                      placeholder="お問い合わせ内容をご記入ください"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all resize-none" />
                  </div>
                  {formStatus === "error" && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      送信に失敗しました。時間をおいて再度お試しください。
                    </div>
                  )}
                  <button type="submit" disabled={formStatus === "sending"}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium transition-all">
                    {formStatus === "sending" ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />送信中...</>
                    ) : (
                      <><Send className="w-4 h-4" />送信する</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold tracking-tight text-slate-300">山田ラボ合同会社</span>
          </div>
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} 山田ラボ合同会社. All rights reserved. &nbsp;·&nbsp; <button onClick={() => setShowPrivacy(true)} className="hover:text-blue-400 transition-colors underline">プライバシーポリシー</button></p>
        </div>
      </footer>
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">プライバシーポリシー</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-slate-300 space-y-3 text-sm leading-relaxed">
              <p className="text-slate-400 text-xs mb-4">最終更新日：2026年3月8日</p>
              <h3 className="text-white font-semibold">1. 個人情報の取得について</h3>
              <p>山田ラボ合同会社（以下「当社」）は、お問い合わせフォームを通じて、お名前・メールアドレス・お問い合わせ内容等の個人情報を取得する場合があります。</p>
              <h3 className="text-white font-semibold mt-2">2. 個人情報の利用目的</h3>
              <p>取得した個人情報は、お問い合わせへの回答・連絡および当社サービスに関するご案内のみに使用し、その他の目的には使用しません。</p>
              <h3 className="text-white font-semibold mt-2">3. 個人情報の第三者提供</h3>
              <p>当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。</p>
              <h3 className="text-white font-semibold mt-2">4. 個人情報の管理</h3>
              <p>当社は、個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ対策を実施します。</p>
              <h3 className="text-white font-semibold mt-2">5. 個人情報の開示・訂正・削除</h3>
              <p>ご本人から個人情報の開示・訂正・削除のご要望があった場合、合理的な範囲で速やかに対応いたします。</p>
              <h3 className="text-white font-semibold mt-2">6. お問い合わせ</h3>
              <p>個人情報の取り扱いに関するご質問は、当社お問い合わせフォームよりご連絡ください。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
