#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { publishThreadsText } from './threads-api.mjs';
import { buildThreadsText, characterCount, THREADS_CHARACTER_LIMIT } from './threads-lib.mjs';
import { parseRssFeed, rssItemEligibility, unseenRssItems } from './rss-feed.mjs';

function parseArguments(argv) {
  const options = { dryRun: false, previewLatest: 0, waitSeconds: 0 };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (['--feed-url', '--state-file', '--preview-latest', '--wait-seconds'].includes(argument)) {
      const value = argv[index + 1];
      if (value === undefined) throw new Error(`${argument} requires a value`);
      const key = argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      options[key] = ['--preview-latest', '--wait-seconds'].includes(argument)
        ? Number.parseInt(value, 10)
        : value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.feedUrl) throw new Error('--feed-url is required');
  if (!options.stateFile && options.previewLatest === 0) throw new Error('--state-file is required');
  if (!Number.isInteger(options.previewLatest) || options.previewLatest < 0 || options.previewLatest > 10) {
    throw new Error('--preview-latest must be an integer from 0 to 10');
  }
  if (!Number.isInteger(options.waitSeconds) || options.waitSeconds < 0 || options.waitSeconds > 600) {
    throw new Error('--wait-seconds must be an integer from 0 to 600');
  }
  if (options.previewLatest > 0 && !options.dryRun) {
    throw new Error('--preview-latest can only be used with --dry-run');
  }
  return options;
}

async function fetchFeed(feedUrl) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(feedUrl, {
        headers: { Accept: 'application/rss+xml, application/xml;q=0.9' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`RSS request returned HTTP ${response.status}`);
      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw new Error(`Unable to fetch RSS feed after 3 attempts: ${lastError.message}`);
}

async function readState(stateFile) {
  try {
    const state = JSON.parse(await readFile(stateFile, 'utf8'));
    return typeof state.lastGuid === 'string' ? state.lastGuid : '';
  } catch (error) {
    if (error.code === 'ENOENT') return '';
    throw new Error(`Unable to read RSS state: ${error.message}`);
  }
}

async function writeState(stateFile, lastGuid) {
  await mkdir(path.dirname(stateFile), { recursive: true });
  const temporaryFile = `${stateFile}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify({ lastGuid }, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, stateFile);
}

function finalText(item) {
  const text = buildThreadsText({ title: item.title, description: item.description, url: item.url });
  if (characterCount(text) > THREADS_CHARACTER_LIMIT) {
    throw new Error(`Generated text exceeds the ${THREADS_CHARACTER_LIMIT}-character Threads limit`);
  }
  return text;
}

async function preview(items, count) {
  for (const [index, item] of items.slice(0, count).entries()) {
    console.log(`DRY RUN ${index + 1}/${Math.min(count, items.length)} — no API request was made\n\n${finalText(item)}\n`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  let items = parseRssFeed(await fetchFeed(options.feedUrl));
  if (options.previewLatest > 0) {
    await preview(items, options.previewLatest);
    return;
  }

  const lastGuid = await readState(options.stateFile);
  if (!lastGuid) {
    if (!options.dryRun) await writeState(options.stateFile, items[0].guid);
    console.log(`Initialized RSS state at ${items[0].guid}; no existing posts were published`);
    return;
  }

  let newItems = unseenRssItems(items, lastGuid);
  const waitDeadline = Date.now() + (options.waitSeconds * 1_000);
  while (newItems.length === 0 && Date.now() < waitDeadline) {
    const remainingSeconds = Math.ceil((waitDeadline - Date.now()) / 1_000);
    console.log(`No new RSS posts yet; waiting for site deployment (${remainingSeconds}s remaining)`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(15_000, Math.max(0, waitDeadline - Date.now()))));
    items = parseRssFeed(await fetchFeed(options.feedUrl));
    newItems = unseenRssItems(items, lastGuid);
  }
  if (newItems.length === 0) {
    console.log('No new RSS posts to publish');
    return;
  }

  for (const item of newItems) {
    const eligibility = rssItemEligibility(item);
    if (!eligibility.eligible) {
      console.log(`Skipping ${item.url}: ${eligibility.reason}`);
      if (!options.dryRun) await writeState(options.stateFile, item.guid);
      continue;
    }
    const text = finalText(item);
    if (options.dryRun) {
      console.log(`DRY RUN — no API request was made\n\n${text}\n`);
      continue;
    }
    const postId = await publishThreadsText(text);
    await writeState(options.stateFile, item.guid);
    console.log(`Published ${item.url} to Threads (post ID: ${postId})`);
  }
}

main().catch((error) => {
  console.error(`RSS Threads publishing failed: ${error.message}`);
  process.exitCode = 1;
});
