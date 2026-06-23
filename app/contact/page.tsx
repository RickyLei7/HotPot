import type { Metadata } from "next";
import Link from "next/link";
import { SocialLinks } from "../social-links";

export const metadata: Metadata = {
  title: "Contact Centre Street Japanese HotPot | Calgary Location",
  description:
    "Call Centre Street Japanese HotPot in Calgary to reserve a table, ask about group dining, check today's availability, or find our address, phone number, hours, and directions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Centre Street Japanese HotPot | Calgary Location",
    description:
      "Call Centre Street Japanese HotPot in Calgary for reservations, group dining, today's availability, address, hours, and Google Maps directions.",
    url: "https://centrestjhotpot.ca/contact/",
    images: ["/assets/hero-beef-noodle.webp"],
  },
};

export default function ContactPage() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" width="600" height="184" />
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/#visit">Visit</Link>
        </div>
        <a className="nav-call" href="tel:+14034553188">Reserve</a>
      </nav>

      <section className="page-hero contact-page-hero">
        <div>
          <p className="eyebrow">Contact & Location</p>
          <h1>Visit Centre Street Japanese HotPot in Calgary</h1>
          <p className="hero-text">
            Call us to reserve a table, ask about group dining, or check today&apos;s availability
            before visiting for Japanese-style hot pot, Taiwanese snacks, and milk tea.
          </p>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="section-heading compact">
          <p className="eyebrow">Visit us</p>
          <h2>2213 Centre St N #2243, Calgary, AB T2E 2T4</h2>
        </div>
        <div className="visit-grid">
          <article>
            <h3>Hours</h3>
            <p>Mon-Fri 17:00-22:30</p>
            <p>Sat-Sun 12:00-22:30</p>
          </article>
          <article>
            <h3>Reservations</h3>
            <p><a href="tel:+14034553188">Call to reserve: (403) 455-3188</a></p>
            <p>Ask about group dining and today&apos;s availability.</p>
          </article>
          <article>
            <h3>Email</h3>
            <p><a href="mailto:CentreStJHotpot@gmail.com">CentreStJHotpot@gmail.com</a></p>
          </article>
          <article>
            <h3>Directions</h3>
            <p><a href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj" target="_blank" rel="noreferrer">Open Google Maps</a></p>
          </article>
          <article>
            <h3>Social</h3>
            <p>Follow us for updates, photos, offers, and reviews.</p>
          </article>
        </div>
        <SocialLinks />
      </section>
    </main>
  );
}
