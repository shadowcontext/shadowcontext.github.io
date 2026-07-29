import path from "node:path";

import { DateTime } from "luxon";

import { DUBAI_ZONE } from "./config.mjs";
import { createFixtureDigestWriter } from "./gemini.mjs";
import { generateDailyDigest } from "./orchestrator.mjs";

function args(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    result[argv[index].slice(2).replaceAll("-", "_")] = argv[index + 1];
    index += 1;
  }
  return result;
}

const options = args(process.argv.slice(2));
const digestDate =
  options.date || DateTime.now().setZone(DUBAI_ZONE).toFormat("yyyy-MM-dd");

generateDailyDigest({
  repoRoot: process.cwd(),
  digestDate,
  dryRun: options.dry_run === "true",
  writeDigest:
    options.mock_gemini === "true" ? createFixtureDigestWriter() : undefined,
})
  .then((result) => {
    console.log(`Generated LinkedIn digest: ${result.manifest.title}`);
    console.log(`Date: ${result.manifest.digestDate}`);
    console.log(`Articles: ${result.manifest.articleCount}`);
    console.log(`Slides: ${result.manifest.imageFiles.length}`);
    console.log(`Output: ${result.relativeDirectory}`);
  })
  .catch((error) => {
    const message = `LinkedIn digest generation failed: ${error.message}`;
    console.error(message);
    if (process.env.GITHUB_ACTIONS === "true") {
      console.error(`::error title=LinkedIn digest generation failed::${message}`);
    }
    process.exitCode = 1;
  });
