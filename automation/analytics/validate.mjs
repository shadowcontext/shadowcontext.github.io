import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
}

function argument(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function configuredMeasurementId(config) {
  const match = config.match(/^google_analytics:\s*["']?([^"'#\s]*)/m);
  return match?.[1]?.trim() || "";
}

const buildDirectory = path.resolve(argument("build-directory", "_site"));
const configPath = path.resolve(argument("config", "_config.yml"));
const override = argument("measurement-id");
const measurementId =
  override || configuredMeasurementId(await readFile(configPath, "utf8"));
const files = await walk(buildDirectory);
if (!files.length) throw new Error(`No built HTML found in ${buildDirectory}`);

const pages = await Promise.all(
  files.map(async (file) => ({
    file,
    html: await readFile(file, "utf8"),
  })),
);
const tagged = pages.filter(({ html }) =>
  html.includes("shadowcontext.analytics-consent.v1"),
);
const externalLoaderReferences = pages.filter(({ html }) =>
  html.includes("https://www.googletagmanager.com/gtag/js?id="),
);

if (!measurementId) {
  if (tagged.length || externalLoaderReferences.length) {
    throw new Error("Analytics code rendered while google_analytics is blank");
  }
  console.log(
    `Analytics validation passed: disabled across ${files.length} HTML files`,
  );
  process.exit(0);
}

if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
  throw new Error("google_analytics must be a GA4 Measurement ID beginning G-");
}
if (!tagged.length) throw new Error("No built pages contain analytics consent");
if (tagged.length !== externalLoaderReferences.length) {
  throw new Error("Analytics initialization and loader counts do not match");
}
for (const { file, html } of tagged) {
  const requirements = [
    measurementId,
    'analytics_storage: "denied"',
    'ad_storage: "denied"',
    "allow_google_signals: false",
    "allow_ad_personalization_signals: false",
    "data-analytics-consent",
    "data-analytics-settings",
    "/privacypolicy/",
  ];
  for (const requirement of requirements) {
    if (!html.includes(requirement)) {
      throw new Error(`${file} is missing analytics control: ${requirement}`);
    }
  }
}
console.log(
  `Analytics validation passed: ${measurementId} is consent-gated on ${tagged.length} HTML pages`,
);
