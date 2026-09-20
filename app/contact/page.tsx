import type { Metadata } from "next";
import { SocialLinks } from "../social-links";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Contact Centre Street Japanese HotPot | Calgary Location",
  description:
    "Book a table online at Centre Street Japanese HotPot in Calgary. Find our phone, Centre Street address, opening hours and Google Maps directions.",
  alternates: {
    canonical: "/contact",
    languages: {
      "en-CA": "/contact/",
      "zh-Hant-CA": "/zh-hant/contact/",
      "x-default": "/contact/",
    },
  },
  openGraph: {
    title: "Contact Centre Street Japanese HotPot | Calgary Location",
    description:
      "Book online or call Centre Street Japanese HotPot in Calgary for reservations, group dining, today's availability, address, hours, and directions.",
    url: "https://centrestjhotpot.ca/contact/",
    images: ["/assets/hero-beef-noodle.webp"],
  },
};

export default function ContactPage() {
  return (
    <main>
      <SiteNav currentPath="/contact/" />

      <section className="page-hero contact-page-hero">
        <div>
          <p className="eyebrow">Contact & Location</p>
          <h1>Visit Centre Street Japanese HotPot in Calgary</h1>
          <p className="hero-text">
            Book online, or call us about groups and today&apos;s table availability.
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
            <p><a href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>Book a table online</a></p>
            <p>Prefer to call? <a href="tel:+14034553188">(403) 455-3188</a></p>
          </article>
          <article>
            <h3>Email</h3>
            <p><a href="mailto:info@centrestjhotpot.ca">info@centrestjhotpot.ca</a></p>
          </article>
          <article>
            <h3>Directions</h3>
            <p><a href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj" target="_blank" rel="noreferrer">Open Google Maps</a></p>
          </article>
          <article>
            <h3>Reviews</h3>
            <p><a href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj" target="_blank" rel="noreferrer">Review us on Google</a></p>
            <p>Your review helps more Calgary guests find us.</p>
          </article>
          <article>
            <h3>Social</h3>
            <p>Follow us for new dishes, offers, and restaurant updates.</p>
          </article>
        </div>
        <SocialLinks />
      </section>
    </main>
  );
}
