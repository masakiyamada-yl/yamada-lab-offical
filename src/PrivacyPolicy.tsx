import { Shield, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900">プライバシーポリシー</h1>
        <p className="text-sm text-slate-500 mb-1">制定日：2026年3月23日</p>
        <p className="text-sm text-slate-500 mb-12">最終改定日：2026年5月6日</p>

        <div className="space-y-10 text-slate-700 leading-relaxed">

          <section>
            <p>
              山田ラボ合同会社（以下「当社」といいます。）は、お客様の個人情報の保護を重要な責務と認識し、個人情報の保護に関する法律（個人情報保護法）およびその他の関係法令を遵守するとともに、以下のとおりプライバシーポリシーを定め、適切な取扱いに努めます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第1条（取得する個人情報の項目）</h2>
            <p className="mb-3">当社は、以下の個人情報を取得することがあります。</p>
            <ul className="space-y-2 pl-5 list-disc text-slate-600">
              <li>氏名</li>
              <li>メールアドレス</li>
              <li>電話番号</li>
              <li>会社名・所属部署</li>
              <li>お問い合わせ内容</li>
              <li>その他、お客様が当社へのお問い合わせ時に提供する情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第2条（個人情報の利用目的）</h2>
            <p className="mb-3">当社は、取得した個人情報を以下の目的のために利用します。</p>
            <ul className="space-y-2 pl-5 list-disc text-slate-600">
              <li>お問い合わせへの回答および対応</li>
              <li>当社のサービス・製品に関する情報のご提供</li>
              <li>契約の締結・履行に関する業務</li>
              <li>法令に基づく義務の履行</li>
              <li>その他、上記の利用目的に付随する業務</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第3条（第三者への提供）</h2>
            <p className="mb-3">当社は、以下の場合を除き、お客様の個人情報を第三者に提供しません。</p>
            <ul className="space-y-2 pl-5 list-disc text-slate-600">
              <li>お客様の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要な場合であって、お客様の同意を得ることが困難な場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第4条（外国にある第三者への提供）</h2>
            <p className="mb-3">
              当社は、お客様の個人情報を以下のとおり外国にある事業者に提供することがあります。これは、当社が利用するクラウドサービスの運営事業者が外国に所在するためです。
            </p>
            <h3 className="text-base font-bold mt-6 mb-2 text-slate-800">1. 移転先の事業者および所在国</h3>
            <p className="mb-3 text-slate-600">
              Google LLC（米国カリフォルニア州。Google Workspace および Google Cloud Platform の提供元）
            </p>
            <h3 className="text-base font-bold mt-6 mb-2 text-slate-800">2. 当該事業者が講ずる個人情報の保護のための措置</h3>
            <p className="mb-3 text-slate-600">
              当社は、Google LLC との間で Cloud Data Processing Addendum（CDPA: クラウドデータ処理に関する追補契約）に同意しています（2026年5月6日同意）。当該 CDPA には、欧州委員会が承認した標準契約条項（SCCs）に相当する条項が含まれており、Google LLC は契約上、個人データの処理に際して適切な技術的および組織的な安全管理措置を講ずる義務を負っています。
            </p>
            <h3 className="text-base font-bold mt-6 mb-2 text-slate-800">3. 移転先国（米国）における個人情報の保護に関する制度</h3>
            <p className="mb-3 text-slate-600">
              米国には、日本の個人情報保護法に相当する包括的な連邦レベルの個人情報保護法は存在しません。ただし、カリフォルニア州消費者プライバシー法（CCPA/CPRA）をはじめとする州法、医療情報に関するHIPAA、金融情報に関するGLBA等の分野別の連邦法、及び連邦取引委員会（FTC）による執行措置が個人情報の保護に寄与しています。当社は、上記 CDPA の契約上の保護措置により、これらの制度上の相違を補完しています。
            </p>
            <h3 className="text-base font-bold mt-6 mb-2 text-slate-800">4. 相当措置の継続的な確認</h3>
            <p className="mb-3 text-slate-600">
              当社は、Google LLC が CDPA に基づき講ずべき措置を継続的に実施しているかについて、年1回以上確認を行い、問題が確認された場合は適切な対応を講じます。
            </p>
            <p className="mt-4 text-xs text-slate-600">
              ※ 本条の記載は暫定版です。当社は今後、法令およびガイドラインの要求に基づき、本ポリシーの包括的な改定を予定しています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第5条（業務委託）</h2>
            <p>
              当社は、利用目的の達成に必要な範囲において、業務を外部に委託する場合があります。その際は、委託先に対して個人情報の適切な取扱いを義務付け、必要かつ適切な監督を行います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第6条（個人情報の安全管理）</h2>
            <p>
              当社は、個人情報の漏えい、滅失またはき損の防止その他個人情報の安全管理のために必要かつ適切な措置を講じます。また、個人情報を取り扱う従業員に対して、適切な教育・監督を行います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第7条（個人情報の開示・訂正・利用停止等）</h2>
            <p>
              お客様は、当社が保有する自己の個人情報について、開示・訂正・追加・削除・利用停止・消去・第三者提供の停止を請求することができます。ご請求は下記お問い合わせ窓口までご連絡ください。法令に定める要件を満たす場合、合理的な期間内に対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第8条（Cookieおよびアクセス解析）</h2>
            <p>
              当社ウェブサイトでは、現時点においてCookieを使用したアクセス解析ツールは導入しておりません。今後導入する場合は、本ポリシーを改定してお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第9条（プライバシーポリシーの改定）</h2>
            <p>
              当社は、法令の改正やサービスの変更等に応じて、本ポリシーを改定することがあります。改定した場合は、当社ウェブサイトに掲載することによりお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">第10条（お問い合わせ窓口）</h2>
            <p className="mb-4">個人情報の取扱いに関するご意見・ご質問は、下記までご連絡ください。</p>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-2 text-sm">
              <p><span className="text-slate-500">社名</span>　山田ラボ合同会社</p>
              <p><span className="text-slate-500">住所</span>　〒812-0011 福岡県福岡市博多区博多駅前1丁目23番2号 ParkFront博多駅前1丁目5F-B</p>
              <p>
                <span className="text-slate-500">メール</span>
                <a href="mailto:contact@yamada-lab.co.jp" className="text-blue-600 hover:underline">contact@yamada-lab.co.jp</a>
              </p>
            </div>
          </section>

        </div>
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
