import path from "node:path";

import { previousDubaiDate } from "./date.mjs";
import { publishDailyDigest } from "./publisher.mjs";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const defaultDate = previousDubaiDate();
const targetDate = argument("date", defaultDate);
const dryRun = argument("dry-run", "false") === "true";

publishDailyDigest({
  repoRoot: process.cwd(),
  targetDate,
  dryRun,
}).catch((error) => {
  const message = `LinkedIn digest publication failed: ${error.message}`;
  console.error(message);
  if (process.env.GITHUB_ACTIONS === "true") {
    console.error(`::error title=LinkedIn digest publication failed::${message}`);
  }
  process.exitCode = 1;
});
