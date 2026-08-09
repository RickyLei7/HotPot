import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
        <img
          src="/assets/brand-logo-wide-300.webp"
          srcSet="/assets/brand-logo-wide-300.webp 300w, /assets/brand-logo-wide-480.webp 480w, /assets/brand-logo-wide.webp 600w"
          sizes="(max-width: 760px) 52vw, 260px"
          alt="Centre Street Japanese Hotpot"
          width="600"
          height="184"
        />
      </Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/ayce-hot-pot-calgary">AYCE</Link>
        <Link href="/menu">Menu</Link>
        <details className="nav-more">
          <summary>More</summary>
          <div className="nav-more-links">
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/#visit">Visit</Link>
          </div>
        </details>
      </div>
      <a className="nav-call" href="tel:+14034553188">
        Reserve
      </a>
    </nav>
  );
}
