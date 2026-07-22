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

const API_ROOT = 'https://graph.threads.net/v1.0';

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

function requireCredential(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when dry-run mode is disabled`);
  return value;
}

function safeErrorPayload(payload, credentials) {
  let message;
  try {
    const parsed = JSON.parse(payload);
    message = parsed?.error?.message || parsed?.error?.error_user_msg || payload;
  } catch {
    message = payload;
  }
  for (const credential of credentials) {
    if (credential) message = String(message).replaceAll(credential, '[REDACTED]');
  }
  return String(message).slice(0, 500);
}

async function apiRequest(endpoint, parameters, accessToken, credentials) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(parameters),
  });
  const payload = await response.text();
  if (!response.ok) {
    throw new Error(`Threads API request failed (${response.status}): ${safeErrorPayload(payload, credentials)}`);
  }
  const parsed = JSON.parse(payload);
  if (!parsed.id) throw new Error('Threads API response did not include an ID');
  return parsed.id;
}

async function publish(text) {
  const userId = requireCredential('THREADS_USER_ID');
  const accessToken = requireCredential('THREADS_ACCESS_TOKEN');
  const credentials = [userId, accessToken];
  const encodedUserId = encodeURIComponent(userId);
  const containerId = await apiRequest(
    `/${encodedUserId}/threads`,
    { media_type: 'TEXT', text },
    accessToken,
    credentials,
  );
  const postId = await apiRequest(
    `/${encodedUserId}/threads_publish`,
    { creation_id: containerId },
    accessToken,
    credentials,
  );
  console.log(`Threads post published successfully (post ID: ${postId})`);
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
  await publish(text);
}

main().catch((error) => {
  console.error(`Threads publishing failed: ${error.message}`);
  process.exitCode = 1;
});
