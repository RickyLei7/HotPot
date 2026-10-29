import type { Metadata } from "next";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Privacy Policy | Centre Street Japanese HotPot",
  description:
    "Privacy policy for the Centre Street Japanese HotPot website and its internal Google Business Profile publishing tool.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <SiteNav currentPath="/privacy-policy/" />

      <section className="page-hero">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p className="hero-text">Last updated: October 29, 2026</p>
        </div>
      </section>

      <section className="visit">
        <div className="section-heading compact">
          <h2>How Centre Street Japanese HotPot handles information</h2>
          <p>
            This policy covers centrestjhotpot.ca and the private publishing tool used by the
            restaurant owner to manage Centre Street Japanese HotPot&apos;s Google Business Profile.
          </p>
        </div>

        <div className="visit-grid">
          <article id="ai-helper">
            <h3>Website chat &amp; automated replies</h3>
            <p>When you select Send in the website chat, your question, page language and up to three previous menu topic IDs are sent through our Cloudflare service to OpenAI to select relevant restaurant information. Do not enter names, contact details or reservation information. The helper cannot make a booking or access customer records. You can use our menu and Book Online without the helper.</p>
            <p>The last ten chat turns stay in memory on the current page and clear when you leave or reload it. We do not save your questions or answers in a conversation database, or send them to Google Analytics. Anonymous helper events record topics and interactions. To limit misuse and cost, our service retains a daily counter and salted, daily client identifiers derived from IP addresses, with request timestamps; these are replaced on the next active day. Cloudflare and OpenAI process technical information under their own terms. We request no stored Responses object; OpenAI may retain abuse-monitoring logs for up to 30 days by default. API data is not used to train OpenAI models by default. See <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer">OpenAI data controls</a>.</p>
            <p lang="zh-Hant">在餐廳小幫手按「傳送」後，問題、頁面語言及最多三個先前的菜單主題代碼會經 Cloudflare 傳送至 OpenAI。請勿輸入姓名、電話、電郵或訂位資料。助手不能代為訂位或查閱客人紀錄。最近十次對話只暫存於目前頁面，離開或重新載入後即清除。我們不會建立對話資料庫，亦不會把問題或回覆傳送至 Google Analytics。為防止濫用，系統會保留每日用量、經加鹽處理的每日連線識別碼及請求時間，於下一個使用日替換。OpenAI 預設可能保留最多30天的濫用監察紀錄；API 資料預設不會用於訓練模型。你也可以直接查看菜單或網上訂位。</p>
          </article>
          <article>
            <h3>Information we collect</h3>
            <p>
              Our website may collect basic technical and usage information, such as browser type,
              device type, pages visited, and interactions with call, map, or menu links. If you
              contact us by phone or email, we receive the information you choose to provide.
            </p>
          </article>
          <article>
            <h3>How we use information</h3>
            <p>
              We use information to operate and improve the website, understand which restaurant
              information is useful, respond to enquiries, and support reservations. We do not sell
              personal information.
            </p>
          </article>
          <article>
            <h3>Google Business Profile access</h3>
            <p>
              The private publishing tool requests Google Business Profile management access only
              for the restaurant owner&apos;s account. It uses that access to read the restaurant&apos;s
              profile and create or review posts requested by the owner. It does not access unrelated
              Google account data.
            </p>
          </article>
          <article>
            <h3>Storage and sharing</h3>
            <p>
              Google OAuth credentials are stored privately on the restaurant&apos;s controlled system
              and are not published or sold. Information may be processed by service providers such
              as Google, Meta, and our website hosting provider under their own privacy terms.
            </p>
          </article>
          <article>
            <h3>Retention and your choices</h3>
            <p>
              We keep information only as long as reasonably needed for the purposes described here.
              You may revoke Google account access at any time through your Google Account security
              settings. You may also contact us to ask about access, correction, or deletion of
              information you provided directly to us.
            </p>
          </article>
          <article>
            <h3>Contact us</h3>
            <p>
              Questions about this policy can be sent to
              {" "}<a href="mailto:info@centrestjhotpot.ca">info@centrestjhotpot.ca</a> or by mail
              to 2213 Centre St N #2243, Calgary, AB T2E 2T4, Canada.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
