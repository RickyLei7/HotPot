import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1080;
const H = 1350;
const outDir = "marketing/social-assets/ig-hotpot-order";
const slides = [
  {
    source: "marketing/source-assets/instagram/f1659349c3920acf.jpg",
    output: "01-soup-first-1080x1350.jpg",
    number: "1",
    title: "SOUP FIRST",
    subtitle: "BROTH SETS THE MOOD",
    position: "centre",
  },
  {
    source: "marketing/source-assets/instagram/b9bb2192e8349639.jpg",
    output: "02-meat-first-1080x1350.jpg",
    number: "2",
    title: "MEAT FIRST",
    subtitle: "NO SMALL TALK",
    position: "centre",
  },
  {
    source: "marketing/source-assets/instagram/1f6f3ef1ef7b5650.jpg",
    output: "03-snacks-first-1080x1350.jpg",
    number: "3",
    title: "SNACKS FIRST",
    subtitle: "HONESTLY, WE GET IT",
    position: "centre",
  },
];

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function overlay(slide) {
  return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#100503" stop-opacity="0.83"/>
          <stop offset="0.36" stop-color="#100503" stop-opacity="0.20"/>
          <stop offset="0.72" stop-color="#100503" stop-opacity="0"/>
          <stop offset="1" stop-color="#100503" stop-opacity="0.26"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.78"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#topShade)"/>
      <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="#f4bf3b" stroke-width="6"/>
      <g filter="url(#shadow)">
        <circle cx="92" cy="213" r="36" fill="#f4bf3b"/>
        <text x="92" y="227" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="37" font-weight="900" fill="#1a0804">${esc(slide.number)}</text>
        <text x="70" y="340" font-family="Arial, Helvetica, sans-serif" font-size="94" font-weight="900" fill="#fff8e8">${esc(slide.title)}</text>
        <text x="74" y="397" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="800" fill="#f4bf3b">${esc(slide.subtitle)}</text>
      </g>
      <text x="70" y="1240" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" fill="#fff8e8" opacity="0.95">CENTRE STREET JAPANESE HOTPOT · CALGARY</text>
    </svg>`;
}

await fs.mkdir(outDir, { recursive: true });
for (const slide of slides) {
  const source = await sharp(slide.source)
    .rotate()
    .resize(W, H, { fit: "cover", position: slide.position })
    .modulate({ brightness: 1.08, saturation: 1.13 })
    .sharpen({ sigma: 1.15 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  await sharp(source)
    .composite([{ input: Buffer.from(overlay(slide)) }])
    .jpeg({ quality: 91, mozjpeg: true })
    .toFile(path.join(outDir, slide.output));
}

console.log(`Created ${slides.length} carousel slides in ${outDir}`);
