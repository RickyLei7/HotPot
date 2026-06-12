const socialLinks = [
  {
    label: "Instagram",
    shortLabel: "IG",
    href: "https://www.instagram.com/centrestreetjapanesehotpot/",
  },
  {
    label: "Facebook",
    shortLabel: "FB",
    href: "https://www.facebook.com/CentreStreetJapaneseHotPot",
  },
  {
    label: "小红书",
    shortLabel: "RED",
    href: "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
  },
  {
    label: "Google Maps",
    shortLabel: "MAP",
    href: "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj",
  },
];

export function SocialLinks() {
  return (
    <div className="social-links" aria-label="Social and review links">
      {socialLinks.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
          <span aria-hidden="true">{link.shortLabel}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export { socialLinks };
