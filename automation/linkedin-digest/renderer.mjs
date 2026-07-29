import { execFile } from "node:child_process";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { SITE_ORIGIN } from "./config.mjs";

const execFileAsync = promisify(execFile);
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TEMPLATE_PATH = path.join(MODULE_DIRECTORY, "template.html");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceToken(template, token, value) {
  return template.replaceAll(`{{${token}}}`, String(value));
}

function storyMarkup(story, post, index) {
  return `
    <article class="story">
      <div class="story-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="story-copy">
        <p class="topic">${escapeHtml(story.topic)}</p>
        <h3>${escapeHtml(story.headline)}</h3>
        <p class="summary">${escapeHtml(story.summary)}</p>
        <div class="why">
          <span>Why it matters</span>
          <p>${escapeHtml(story.why_it_matters)}</p>
        </div>
        <a class="source-link" href="${escapeHtml(post.canonicalUrl)}">${escapeHtml(post.title)} ↗</a>
      </div>
    </article>`;
}

function sourceMarkup(post, index) {
  return `
    <li>
      <span>${String(index + 1).padStart(2, "0")}</span>
      <a href="${escapeHtml(post.canonicalUrl)}">${escapeHtml(post.title)}</a>
    </li>`;
}

export async function buildDigestHtml({
  digestDate,
  posts,
  content,
  templatePath = DEFAULT_TEMPLATE_PATH,
}) {
  let html = await readFile(templatePath, "utf8");
  const replacements = {
    DOCUMENT_TITLE: escapeHtml(`${content.digest_title} | ShadowContext`),
    DIGEST_DATE: escapeHtml(digestDate),
    ARTICLE_COUNT: posts.length,
    DIGEST_TITLE: escapeHtml(content.digest_title),
    DEK: escapeHtml(content.dek),
    OVERVIEW: escapeHtml(content.overview),
    STORIES: content.stories
      .map((story, index) => storyMarkup(story, posts[index], index))
      .join("\n"),
    OPERATING_VIEW: escapeHtml(content.operating_view),
    WATCH_ITEMS: content.watch_items
      .map(
        (item, index) =>
          `<li><span>${index + 1}</span><p>${escapeHtml(item)}</p></li>`,
      )
      .join("\n"),
    SOURCE_LIST: posts.map(sourceMarkup).join("\n"),
    SITE_ORIGIN: escapeHtml(`${SITE_ORIGIN}/`),
  };
  for (const [token, value] of Object.entries(replacements)) {
    html = replaceToken(html, token, value);
  }
  const unresolved = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) {
    throw new Error(`Unresolved digest template token: ${unresolved[0]}`);
  }
  return html;
}

async function findChrome() {
  const configured = process.env.CHROME_PATH;
  const candidates = [
    configured,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known runner location.
    }
  }
  throw new Error(
    "Chrome is required for deterministic HTML-to-PDF rendering; set CHROME_PATH",
  );
}

export async function renderHtmlToPdf({
  htmlPath,
  pdfPath,
  chromePath,
}) {
  const executable = chromePath || (await findChrome());
  await execFileAsync(
    executable,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=1000",
      `--print-to-pdf=${path.resolve(pdfPath)}`,
      pathToFileURL(path.resolve(htmlPath)).href,
    ],
    { timeout: 120_000, maxBuffer: 1024 * 1024 },
  );
  const metadata = await stat(pdfPath);
  if (metadata.size < 1_000) {
    throw new Error(`Generated PDF is unexpectedly small: ${metadata.size} bytes`);
  }
  return metadata;
}

export async function renderDigest({
  digestDate,
  posts,
  content,
  outputDirectory,
  templatePath,
  pdfRenderer = renderHtmlToPdf,
}) {
  const html = await buildDigestHtml({
    digestDate,
    posts,
    content,
    templatePath,
  });
  const htmlPath = path.join(outputDirectory, "daily-digest.html");
  const pdfPath = path.join(outputDirectory, "daily-digest.pdf");
  await writeFile(htmlPath, html, "utf8");
  await pdfRenderer({ htmlPath, pdfPath });
  return {
    html: { filename: "daily-digest.html", filePath: htmlPath },
    pdf: { filename: "daily-digest.pdf", filePath: pdfPath },
  };
}
