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
          <p className="hero-text">Last updated: September 1, 2026</p>
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
              {" "}<a href="mailto:CentreStJHotpot@gmail.com">CentreStJHotpot@gmail.com</a> or by mail
              to 2213 Centre St N #2243, Calgary, AB T2E 2T4, Canada.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
