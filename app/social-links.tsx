const socialLinks = [
  {
    label: "Instagram",
    shortLabel: "◎",
    href: "https://www.instagram.com/centrestreetjapanesehotpot/",
    className: "social-instagram",
  },
  {
    label: "Facebook",
    shortLabel: "f",
    href: "https://www.facebook.com/CentreStreetJapaneseHotPot",
    className: "social-facebook",
  },
  {
    label: "Threads",
    shortLabel: "@",
    href: "https://www.threads.com/@centrestreetjapanesehotpot",
    className: "social-threads",
  },
  {
    label: "TikTok",
    shortLabel: "♪",
    href: "https://www.tiktok.com/@stjapanesehotpot",
    className: "social-tiktok",
  },
  {
    label: "Xiaohongshu",
    shortLabel: "XHS",
    href: "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
    className: "social-red",
  },
];

export function SocialLinks() {
  return (
    <div className="social-links" aria-label="Social and review links">
      {socialLinks.map((link) => (
        <a className={`social-link ${link.className}`} key={link.label} href={link.href} target="_blank" rel="noreferrer">
          <span className="social-icon" aria-hidden="true">{link.shortLabel}</span>
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}

export { socialLinks };
