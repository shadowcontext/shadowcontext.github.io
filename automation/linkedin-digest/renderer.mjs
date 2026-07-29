import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  BRAND,
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  SITE_ORIGIN,
} from "./config.mjs";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function wrapText(value, maxCharacters, maxLines) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharacters || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    throw new Error(
      `Text exceeds layout capacity (${lines.length}/${maxLines} lines): ${value}`,
    );
  }
  return lines;
}

function textLines(
  lines,
  {
    x,
    y,
    size,
    lineHeight,
    color = BRAND.ink,
    weight = 600,
    family = BRAND.sans,
    anchor,
  },
) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}"${anchor ? ` text-anchor="${anchor}"` : ""} fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function brandMark() {
  return `
    <g transform="translate(86 76) rotate(30 24 24)">
      <rect x="3" y="3" width="42" height="42" rx="5" fill="none" stroke="${BRAND.cyan}" stroke-width="4"/>
      <rect x="13" y="13" width="22" height="22" rx="4" fill="none" stroke="${BRAND.violet}" stroke-width="4"/>
      <rect x="21" y="21" width="7" height="7" rx="2" fill="${BRAND.cyan}"/>
    </g>
    <text x="152" y="110" fill="${BRAND.ink}" font-family="${BRAND.sans}" font-size="31" font-weight="700">Shadow<tspan fill="${BRAND.cyan}">Context</tspan></text>
  `;
}

function signalField(seed) {
  const bytes = createHash("sha256").update(seed).digest();
  const nodes = Array.from({ length: 13 }, (_, index) => {
    const x = 610 + (bytes[index] % 390);
    const y = 170 + (bytes[index + 13] % 430);
    const radius = 4 + (bytes[index + 5] % 8);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${index % 3 ? BRAND.cyan : BRAND.violet}" opacity="${0.12 + (index % 4) * 0.06}"/>`;
  }).join("");
  return `
    <g>
      <circle cx="824" cy="360" r="250" fill="none" stroke="${BRAND.violet}" stroke-opacity=".1" stroke-width="2"/>
      <circle cx="824" cy="360" r="176" fill="none" stroke="${BRAND.cyan}" stroke-opacity=".08" stroke-width="2"/>
      <path d="M574 360h500M824 110v500" stroke="${BRAND.cyan}" stroke-opacity=".06" stroke-width="2"/>
      ${nodes}
    </g>`;
}

function baseSvg({ number, total, label, seed, content }) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" viewBox="0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1080" y2="1350">
        <stop stop-color="${BRAND.navy}"/>
        <stop offset=".62" stop-color="#081017"/>
        <stop offset="1" stop-color="#0c101c"/>
      </linearGradient>
      <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
        <path d="M54 0H0V54" fill="none" stroke="${BRAND.cyan}" stroke-opacity=".032" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <rect width="1080" height="1350" fill="url(#grid)"/>
    <rect x="32" y="32" width="1016" height="1286" rx="6" fill="none" stroke="${BRAND.line}" stroke-width="2"/>
    <path d="M32 170H1048" stroke="${BRAND.line}" stroke-width="2"/>
    ${signalField(seed)}
    ${brandMark()}
    <text x="994" y="105" text-anchor="end" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="18" letter-spacing="2">${escapeXml(label)}</text>
    ${content}
    <path d="M86 1245H994" stroke="${BRAND.line}" stroke-width="2"/>
    <text x="86" y="1291" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="18" letter-spacing="1.4">SHADOWCONTEXT.COM</text>
    <text x="994" y="1291" text-anchor="end" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="18">${number}/${total}</text>
  </svg>`;
}

function renderCover({ digestDate, content, articleCount, total }) {
  const title = wrapText(content.digest_title, 19, 4);
  const titleSize = title.length >= 4 ? 69 : 78;
  const dek = wrapText(content.dek, 49, 3);
  const overview = wrapText(content.overview, 65, 3);
  return baseSvg({
    number: 1,
    total,
    label: "DAILY DIGEST",
    seed: `${digestDate}:${content.digest_title}`,
    content: `
      <text x="86" y="252" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20" letter-spacing="3">DAILY SECURITY DIGEST</text>
      ${textLines(title, { x: 86, y: 365, size: titleSize, lineHeight: titleSize * 1.06 })}
      ${textLines(dek, { x: 86, y: 690, size: 31, lineHeight: 42, color: BRAND.inkSecondary, weight: 500 })}
      <rect x="62" y="850" width="956" height="270" rx="8" fill="${BRAND.panel}" fill-opacity=".9" stroke="${BRAND.line}" stroke-width="2"/>
      <text x="86" y="908" fill="${BRAND.violet}" font-family="${BRAND.mono}" font-size="17" letter-spacing="2.4">THE DAY IN CONTEXT</text>
      ${textLines(overview, { x: 86, y: 960, size: 26, lineHeight: 36, color: BRAND.inkSecondary, weight: 500 })}
      <text x="86" y="1177" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="18" letter-spacing="1.2">${escapeXml(digestDate)} · ${articleCount} BRIEFINGS</text>
      <rect x="86" y="1202" width="145" height="4" fill="${BRAND.cyan}"/>
    `,
  });
}

function storyPanel({ story, post, index, x, y, width }) {
  const headline = wrapText(story.headline, width > 850 ? 48 : 34, 3);
  const summary = wrapText(story.summary, width > 850 ? 76 : 52, 3);
  const why = wrapText(story.why_it_matters, width > 850 ? 82 : 55, 2);
  const slug = new URL(post.canonicalUrl).pathname;
  return `
    <rect x="${x}" y="${y}" width="${width}" height="418" rx="8" fill="${BRAND.panel}" fill-opacity=".93" stroke="${BRAND.line}" stroke-width="2"/>
    <text x="${x + 28}" y="${y + 50}" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="17" letter-spacing="2">${String(index + 1).padStart(2, "0")} / ${escapeXml(story.topic.toUpperCase())}</text>
    ${textLines(headline, { x: x + 28, y: y + 105, size: 34, lineHeight: 40, color: BRAND.ink, weight: 650 })}
    ${textLines(summary, { x: x + 28, y: y + 228, size: 22, lineHeight: 30, color: BRAND.inkSecondary, weight: 500 })}
    <text x="${x + 28}" y="${y + 342}" fill="${BRAND.violet}" font-family="${BRAND.mono}" font-size="15" letter-spacing="1.5">WHY IT MATTERS</text>
    ${textLines(why, { x: x + 28, y: y + 376, size: 18, lineHeight: 24, color: BRAND.ink, weight: 550 })}
    <text x="${x + width - 28}" y="${y + 405}" text-anchor="end" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="13">${escapeXml(slug)}</text>
  `;
}

function renderStories({ stories, posts, pageIndex, total }) {
  const number = pageIndex + 2;
  const firstIndex = pageIndex * 2;
  const pageStories = stories.slice(firstIndex, firstIndex + 2);
  const panels =
    pageStories.length === 1
      ? storyPanel({
          story: pageStories[0],
          post: posts[firstIndex],
          index: firstIndex,
          x: 62,
          y: 370,
          width: 956,
        })
      : [
          storyPanel({
            story: pageStories[0],
            post: posts[firstIndex],
            index: firstIndex,
            x: 62,
            y: 310,
            width: 956,
          }),
          storyPanel({
            story: pageStories[1],
            post: posts[firstIndex + 1],
            index: firstIndex + 1,
            x: 62,
            y: 750,
            width: 956,
          }),
        ].join("");
  return baseSvg({
    number,
    total,
    label: `TODAY'S SIGNALS / ${String(number).padStart(2, "0")}`,
    seed: `${stories[firstIndex].source_id}:${stories[firstIndex].headline}`,
    content: `
      <text x="86" y="246" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="19" letter-spacing="3">TODAY'S SIGNALS</text>
      <text x="994" y="246" text-anchor="end" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="17">${firstIndex + 1}–${firstIndex + pageStories.length} OF ${stories.length}</text>
      ${panels}
    `,
  });
}

function renderClosing({ content, total }) {
  const view = wrapText(content.operating_view, 37, 5);
  const items = content.watch_items
    .map((item, index) => {
      const lines = wrapText(item, 50, 2);
      const y = 690 + index * 128;
      return `
        <rect x="86" y="${y - 21}" width="36" height="36" rx="5" fill="${index === 1 ? BRAND.violet : BRAND.cyan}" fill-opacity=".16" stroke="${index === 1 ? BRAND.violet : BRAND.cyan}" stroke-width="2"/>
        <text x="104" y="${y + 4}" text-anchor="middle" fill="${index === 1 ? BRAND.violet : BRAND.cyan}" font-family="${BRAND.mono}" font-size="16">${index + 1}</text>
        ${textLines(lines, { x: 150, y, size: 27, lineHeight: 34, color: BRAND.inkSecondary, weight: 500 })}
      `;
    })
    .join("");
  return baseSvg({
    number: total,
    total,
    label: "OPERATING VIEW",
    seed: content.operating_view,
    content: `
      <text x="86" y="252" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20" letter-spacing="3">THE OPERATING VIEW</text>
      ${textLines(view, { x: 86, y: 350, size: 38, lineHeight: 46, color: BRAND.ink, weight: 620 })}
      <path d="M86 596H994" stroke="${BRAND.line}" stroke-width="2"/>
      <text x="86" y="644" fill="${BRAND.violet}" font-family="${BRAND.mono}" font-size="17" letter-spacing="2.4">WHAT TO VERIFY NEXT</text>
      ${items}
      <rect x="62" y="1088" width="956" height="112" rx="8" fill="${BRAND.cyan}" fill-opacity=".08" stroke="${BRAND.cyan}" stroke-opacity=".35" stroke-width="2"/>
      <text x="86" y="1135" fill="${BRAND.ink}" font-family="${BRAND.sans}" font-size="25" font-weight="600">Read the full analysis</text>
      <text x="86" y="1172" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20">${SITE_ORIGIN}/</text>
    `,
  });
}

export function buildSlideSvgs({ digestDate, posts, content }) {
  const storyPages = Math.ceil(content.stories.length / 2);
  const total = storyPages + 2;
  return [
    renderCover({
      digestDate,
      content,
      articleCount: posts.length,
      total,
    }),
    ...Array.from({ length: storyPages }, (_, pageIndex) =>
      renderStories({
        stories: content.stories,
        posts,
        pageIndex,
        total,
      }),
    ),
    renderClosing({ content, total }),
  ];
}

export async function renderDigest({
  digestDate,
  posts,
  content,
  outputDirectory,
}) {
  await mkdir(outputDirectory, { recursive: true });
  const svgs = buildSlideSvgs({ digestDate, posts, content });
  const slides = [];
  for (const [index, svg] of svgs.entries()) {
    const filename = `slide-${String(index + 1).padStart(2, "0")}.png`;
    const filePath = path.join(outputDirectory, filename);
    await sharp(Buffer.from(svg))
      .resize(SLIDE_WIDTH, SLIDE_HEIGHT, { fit: "fill" })
      .flatten({ background: BRAND.navy })
      .toColourspace("srgb")
      .png({ compressionLevel: 9 })
      .toFile(filePath);
    const metadata = await sharp(filePath).metadata();
    if (
      metadata.width !== SLIDE_WIDTH ||
      metadata.height !== SLIDE_HEIGHT ||
      metadata.space !== "srgb" ||
      metadata.channels !== 3
    ) {
      throw new Error(`${filename} failed RGB output validation`);
    }
    slides.push({ filename, filePath, width: metadata.width, height: metadata.height });
  }
  return slides;
}
