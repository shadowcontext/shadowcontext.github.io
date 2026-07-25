import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { BRAND, DUBAI_ZONE, SLIDE_HEIGHT, SLIDE_WIDTH } from "./config.mjs";

const SAFE = Object.freeze({ left: 86, right: 994, top: 78, bottom: 1268 });

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
    if (next.length <= maxCharacters || !current) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    throw new Error(
      `Text exceeds layout capacity (${lines.length} lines; maximum ${maxLines}): ${value}`,
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
  },
) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function brandMark() {
  return `
    <g transform="translate(88 87) rotate(30 24 24)">
      <rect x="3" y="3" width="42" height="42" rx="5" fill="none" stroke="${BRAND.cyan}" stroke-width="4"/>
      <rect x="13" y="13" width="22" height="22" rx="4" fill="none" stroke="${BRAND.violet}" stroke-width="4"/>
      <rect x="21" y="21" width="7" height="7" rx="2" fill="${BRAND.cyan}"/>
    </g>
    <text x="154" y="121" fill="${BRAND.ink}" font-family="${BRAND.sans}" font-size="31" font-weight="700">Shadow<tspan fill="${BRAND.cyan}">Context</tspan></text>
  `;
}

function motif(seed, accent) {
  const digest = createHash("sha256").update(seed).digest();
  const nodes = Array.from({ length: 9 }, (_, index) => {
    const x = 650 + (digest[index] % 330);
    const y = 180 + (digest[index + 9] % 460);
    const radius = 5 + (digest[index + 18] % 10);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${index % 3 === 0 ? accent : BRAND.cyan}" opacity="${0.16 + (index % 4) * 0.08}"/>`;
  }).join("");
  return `
    <g opacity=".82">
      <circle cx="860" cy="355" r="236" fill="none" stroke="${accent}" stroke-opacity=".12" stroke-width="2"/>
      <circle cx="860" cy="355" r="166" fill="none" stroke="${BRAND.cyan}" stroke-opacity=".1" stroke-width="2"/>
      <path d="M624 355h472M860 119v472" stroke="${BRAND.cyan}" stroke-opacity=".08" stroke-width="2"/>
      ${nodes}
    </g>
  `;
}

function baseSvg({
  slideNumber,
  totalSlides,
  category,
  seed,
  accent = BRAND.violet,
  content,
}) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" viewBox="0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1080" y2="1350">
        <stop stop-color="${BRAND.navy}"/>
        <stop offset=".58" stop-color="#081017"/>
        <stop offset="1" stop-color="#0c101c"/>
      </linearGradient>
      <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
        <path d="M54 0H0V54" fill="none" stroke="${BRAND.cyan}" stroke-opacity=".035" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1080" height="1350" fill="url(#background)"/>
    <rect width="1080" height="1350" fill="url(#grid)"/>
    <rect x="32" y="32" width="1016" height="1286" rx="6" fill="none" stroke="${BRAND.line}" stroke-width="2"/>
    <path d="M32 184H1048" stroke="${BRAND.line}" stroke-width="2"/>
    ${motif(seed, accent)}
    ${brandMark()}
    <text x="994" y="116" text-anchor="end" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="18" letter-spacing="2">${escapeXml(category.toUpperCase())}</text>
    ${content}
    <path d="M86 1245H994" stroke="${BRAND.line}" stroke-width="2"/>
    <text x="86" y="1291" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="18" letter-spacing="1.6">SHADOWCONTEXT.COM</text>
    <text x="994" y="1291" text-anchor="end" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="18">${slideNumber}/${totalSlides}</text>
  </svg>`;
}

function renderCover(post, structure, totalSlides) {
  const headline = wrapText(structure.headline, 20, 5);
  const size = headline.length >= 5 ? 68 : headline.length >= 4 ? 76 : 84;
  const description = wrapText(structure.summary[0], 58, 2);
  const action = wrapText(structure.defender_actions[0], 58, 2);
  const published = post.publishedAt
    .setZone(DUBAI_ZONE)
    .toFormat("dd LLL yyyy · HH:mm ZZZZ");
  const content = `
    <text x="86" y="270" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20" letter-spacing="3">SECURITY BRIEFING</text>
    ${textLines(headline, { x: 86, y: 386, size, lineHeight: size * 1.05 })}
    <rect x="62" y="718" width="956" height="390" rx="8" fill="${BRAND.navy}" fill-opacity=".82" stroke="${BRAND.line}" stroke-width="2"/>
    <text x="86" y="768" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="17" letter-spacing="2.5">IN BRIEF</text>
    ${textLines(description, { x: 86, y: 814, size: 27, lineHeight: 36, color: BRAND.inkSecondary, weight: 500 })}
    <path d="M86 898H994" stroke="${BRAND.line}" stroke-width="2"/>
    <text x="86" y="941" fill="${BRAND.violet}" font-family="${BRAND.mono}" font-size="17" letter-spacing="2.5">ACTION</text>
    ${textLines(action, { x: 86, y: 987, size: 27, lineHeight: 36, color: BRAND.ink, weight: 600 })}
    <text x="86" y="1160" fill="${BRAND.muted}" font-family="${BRAND.mono}" font-size="19" letter-spacing="1">${escapeXml(published)}</text>
    <rect x="86" y="1195" width="122" height="4" fill="${BRAND.cyan}"/>
  `;
  return baseSvg({
    slideNumber: 1,
    totalSlides,
    category: post.category,
    seed: `${post.id}:cover:${structure.visual_theme.concept}`,
    content,
  });
}

function bulletBlockDetails(items, startY, override) {
  const layout =
    override ??
    (items.length === 3
      ? { size: 32, lineHeight: 41, gap: 26, maxCharacters: 42, maxLines: 4 }
      : items.length === 2
        ? { size: 36, lineHeight: 47, gap: 42, maxCharacters: 37, maxLines: 5 }
        : {
            size: 39,
            lineHeight: 51,
            gap: 48,
            maxCharacters: 35,
            maxLines: 7,
          });
  let y = startY;
  let output = "";
  for (const item of items) {
    const lines = wrapText(item, layout.maxCharacters, layout.maxLines);
    output += `<rect x="89" y="${y - 18}" width="11" height="11" rx="2" fill="${BRAND.cyan}"/>`;
    output += textLines(lines, {
      x: 126,
      y,
      size: layout.size,
      lineHeight: layout.lineHeight,
      color: BRAND.inkSecondary,
      weight: 500,
    });
    y += lines.length * layout.lineHeight + layout.gap;
  }
  if (y > SAFE.bottom - 20)
    throw new Error(`Bullet content overflows slide safe area at y=${y}`);
  return { svg: output, endY: y };
}

function bulletBlock(items, startY) {
  return bulletBlockDetails(items, startY).svg;
}

function renderContentSlide({
  post,
  title,
  items,
  number,
  totalSlides,
  accent,
}) {
  const titleLines = wrapText(title, 24, 2);
  const content = `
    <text x="86" y="270" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20" letter-spacing="3">SHADOWCONTEXT / ${String(number).padStart(2, "0")}</text>
    ${textLines(titleLines, { x: 86, y: 365, size: 61, lineHeight: 68 })}
    <rect x="86" y="${440 + (titleLines.length - 1) * 68}" width="180" height="4" fill="${accent}"/>
    ${bulletBlock(items, 585 + (titleLines.length - 1) * 68)}
  `;
  return baseSvg({
    slideNumber: number,
    totalSlides,
    category: post.category,
    seed: `${post.id}:${title}`,
    accent,
    content,
  });
}

function renderCombinedSlide({ post, structure, totalSlides }) {
  const compactLayout = {
    size: 31,
    lineHeight: 40,
    gap: 24,
    maxCharacters: 44,
    maxLines: 3,
  };
  const why = bulletBlockDetails(structure.why_it_matters, 438, compactLayout);
  const actionHeadingY = why.endY + 58;
  const actions = bulletBlockDetails(
    structure.defender_actions,
    actionHeadingY + 78,
    compactLayout,
  );
  const content = `
    <text x="86" y="270" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="20" letter-spacing="3">SHADOWCONTEXT / 03</text>
    <text x="86" y="355" fill="${BRAND.ink}" font-family="${BRAND.sans}" font-size="47" font-weight="600">WHY IT MATTERS</text>
    ${why.svg}
    <text x="86" y="${actionHeadingY}" fill="${BRAND.cyan}" font-family="${BRAND.mono}" font-size="25" font-weight="600" letter-spacing="1.5">WHAT DEFENDERS SHOULD DO</text>
    ${actions.svg}
  `;
  return baseSvg({
    slideNumber: 3,
    totalSlides,
    category: post.category,
    seed: `${post.id}:combined`,
    accent: BRAND.violet,
    content,
  });
}

export function buildSlideSvgs(post, structure) {
  const useCompactStructure =
    typeof post.fullText === "string" &&
    post.fullText.length < 900 &&
    structure.why_it_matters.length === 1 &&
    structure.defender_actions.length <= 2;
  const totalSlides = useCompactStructure ? 3 : 4;
  if (useCompactStructure) {
    return [
      renderCover(post, structure, totalSlides),
      renderContentSlide({
        post,
        title: "WHAT HAPPENED",
        items: structure.summary,
        number: 2,
        totalSlides,
        accent: BRAND.cyan,
      }),
      renderCombinedSlide({ post, structure, totalSlides }),
    ];
  }
  return [
    renderCover(post, structure, totalSlides),
    renderContentSlide({
      post,
      title: "WHAT HAPPENED",
      items: structure.summary,
      number: 2,
      totalSlides,
      accent: BRAND.cyan,
    }),
    renderContentSlide({
      post,
      title: "WHY IT MATTERS",
      items: structure.why_it_matters,
      number: 3,
      totalSlides,
      accent: BRAND.violet,
    }),
    renderContentSlide({
      post,
      title: "WHAT DEFENDERS SHOULD DO",
      items: structure.defender_actions,
      number: 4,
      totalSlides,
      accent: BRAND.cyan,
    }),
  ];
}

export async function renderCarousel({ post, structure, outputDirectory }) {
  await mkdir(outputDirectory, { recursive: true });
  const svgs = buildSlideSvgs(post, structure);
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
      throw new Error(
        `${filename} failed output validation: ${metadata.width}x${metadata.height}, ${metadata.space}, ${metadata.channels} channels`,
      );
    }
    slides.push({
      filename,
      filePath,
      width: metadata.width,
      height: metadata.height,
    });
  }
  return slides;
}
