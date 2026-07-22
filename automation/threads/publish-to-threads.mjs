#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import {
  buildThreadsText,
  canonicalPostUrl,
  characterCount,
  parseFrontMatter,
  parseSiteConfig,
  postEligibility,
  postSummary,
  THREADS_CHARACTER_LIMIT,
} from './threads-lib.mjs';
import { publishThreadsText } from './threads-api.mjs';

function parseArguments(argv) {
  const options = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (['--title', '--description', '--url', '--post-file'].includes(argument)) {
      const value = argv[index + 1];
      if (value === undefined) throw new Error(`${argument} requires a value`);
      options[argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

async function contentFromPost(filePath) {
  const [postSource, configSource] = await Promise.all([
    readFile(filePath, 'utf8'),
    readFile('_config.yml', 'utf8'),
  ]);
  const { data } = parseFrontMatter(postSource);
  const eligibility = postEligibility({ filePath, data });
  if (!eligibility.eligible) return { skipReason: eligibility.reason };
  const siteConfig = parseSiteConfig(configSource);
  return {
    title: data.title,
    description: postSummary(data),
    url: canonicalPostUrl({ filePath, data, siteConfig }),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  let content;
  if (options.postFile) {
    content = await contentFromPost(options.postFile);
    if (content.skipReason) {
      console.log(`Skipping ${options.postFile}: ${content.skipReason}`);
      return;
    }
  } else {
    content = { title: options.title, description: options.description, url: options.url };
  }

  const text = buildThreadsText(content);
  if (characterCount(text) > THREADS_CHARACTER_LIMIT) {
    throw new Error(`Generated text exceeds the ${THREADS_CHARACTER_LIMIT}-character Threads limit`);
  }
  if (options.dryRun) {
    console.log(`DRY RUN — no API request was made\n\n${text}`);
    return;
  }
  const postId = await publishThreadsText(text);
  console.log(`Threads post published successfully (post ID: ${postId})`);
}

main().catch((error) => {
  console.error(`Threads publishing failed: ${error.message}`);
  process.exitCode = 1;
});
