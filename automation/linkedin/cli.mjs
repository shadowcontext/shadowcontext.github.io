import path from "node:path";

import { publishReadyCarousels } from "./publisher.mjs";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const dryRun = argument("dry-run", "false") === "true";
const maxPosts = Number.parseInt(argument("max-posts", "10"), 10);

publishReadyCarousels({
  repoRoot: process.cwd(),
  statePath: path.join(process.cwd(), "automation/linkedin/state.json"),
  dryRun,
  maxPosts,
}).catch((error) => {
  const message = `LinkedIn publication failed: ${error.message}`;
  console.error(message);
  if (process.env.GITHUB_ACTIONS === "true") {
    console.error(`::error title=LinkedIn publication failed::${message}`);
  }
  process.exitCode = 1;
});
