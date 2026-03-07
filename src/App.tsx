import { motion } from "motion/react";
import { Shield, Wifi, Code, ChevronRight, Globe, Lock, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold tracking-tight">Yamada Lab</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solutions" className="hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#company" className="hover:text-blue-400 transition-colors">Company</a>
            <a href="#contact" className="px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">Contact Us</a>
          </div>
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-300 tracking-wide">Border Free & Security</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              世界を、<br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">一つの認証</span>で繋ぐ。
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              OpenRoaming技術と強固な電子認証基盤により、<br className="hidden md:block" />
              国境やネットワークの壁を越えたシームレスで安全な通信体験を提供します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#solutions" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                ソリューションを見る
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Business Solutions */}
      <section id="solutions" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 md:mb-24 text-center md:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Business Solutions</h2>
            <p className="text-slate-400 max-w-2xl mx-auto md:mx-0">高度なセキュリティと利便性を両立する、次世代のインフラストラクチャを構築します。</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Solution 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Wifi className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">通信インフラ</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                電気通信事業法に基づく確かな電気通信事業を展開。コンピュータシステムおよび通信ネットワークのインフラ構築、設計、コンサルティングを提供します。
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />電気通信事業</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />インフラ構築・設計</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />ネットワークコンサルティング</li>
              </ul>
            </motion.div>

            {/* Solution 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Lock className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">認証ソリューション</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                OpenRoamingをはじめとする次世代の電子認証システムの企画、開発、運用及び保守。セキュアでシームレスな接続環境を実現します。
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />電子認証システム開発</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />OpenRoaming連携</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />セキュリティ保守運用</li>
              </ul>
            </motion.div>

            {/* Solution 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                <Code className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">システム開発</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                情報通信システム機器・ソフトウェアの製造、販売。インターネットを利用した情報提供サービスや、先進的なアプリケーションの制作・運営を行います。
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />ソフトウェア製造・販売</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />アプリ制作・運営</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400" />情報提供サービス</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section id="company" className="py-32 bg-slate-900/50 border-t border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12">Company Profile</h2>
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
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square md:aspect-[4/3] bg-slate-800"
            >
              {/* Abstract representation of the company / tech */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <span className="font-semibold tracking-wider">GLOBAL REACH</span>
                </div>
                <p className="text-sm text-slate-400">Fukuoka, Japan to the World.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold tracking-tight text-slate-300">Yamada Lab LLC</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Yamada Lab LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
