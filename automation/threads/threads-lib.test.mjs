import assert from 'node:assert/strict';
import test from 'node:test';
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

test('parses quoted, boolean, and folded front matter values', () => {
  const parsed = parseFrontMatter(`---
title: "A Security: Test"
description: >
  First line
  second line
social_publish: false
---
Body
`);
  assert.equal(parsed.data.title, 'A Security: Test');
  assert.equal(parsed.data.description, 'First line second line');
  assert.equal(parsed.data.social_publish, false);
  assert.equal(parsed.content, 'Body\n');
});

test('uses description, summary, then excerpt for social copy', () => {
  assert.equal(postSummary({ description: '<b>Primary</b>' }), 'Primary');
  assert.equal(postSummary({ summary: 'Summary copy' }), 'Summary copy');
  assert.equal(postSummary({ excerpt: '[Read this](https://example.com)' }), 'Read this');
});

test('generates the configured canonical Jekyll post URL', () => {
  const siteConfig = parseSiteConfig('url: "https://shadowcontext.com"\nbaseurl: "" # an inline comment\npermalink: /:title/\n');
  assert.equal(
    canonicalPostUrl({
      filePath: '_posts/2026-07-22-example-security-post.md',
      data: { title: 'Ignored in favor of filename slug' },
      siteConfig,
    }),
    'https://shadowcontext.com/example-security-post/',
  );
});

test('honors an explicit post permalink and base URL', () => {
  assert.equal(
    canonicalPostUrl({
      filePath: '_posts/2026-07-22-example.md',
      data: { permalink: '/analysis/custom/' },
      siteConfig: { url: 'https://example.com', baseurl: '/site', permalink: '/:title/' },
    }),
    'https://example.com/site/analysis/custom/',
  );
});

test('truncates copy to the Threads limit while preserving the complete URL', () => {
  const url = 'https://shadowcontext.com/important-analysis/';
  const text = buildThreadsText({ title: 'Security analysis', description: 'x'.repeat(800), url });
  assert.equal(characterCount(text), THREADS_CHARACTER_LIMIT);
  assert.ok(text.endsWith(`\n\n${url}`));
  assert.ok(text.includes('…'));
});

test('counts Unicode code points instead of UTF-16 units', () => {
  const text = buildThreadsText({ title: '🔐'.repeat(490), url: 'https://x.test/' });
  assert.ok(characterCount(text) <= THREADS_CHARACTER_LIMIT);
  assert.ok(text.endsWith('https://x.test/'));
});

test('accepts a currently published post', () => {
  assert.deepEqual(
    postEligibility({
      filePath: '_posts/2026-07-21-current.md',
      data: { date: '2026-07-21 12:00:00 +0400' },
      now: new Date('2026-07-22T12:00:00Z'),
    }),
    { eligible: true, reason: 'published post' },
  );
});

test('rejects drafts, unpublished posts, opt-outs, and future dates', () => {
  const now = new Date('2026-07-22T12:00:00Z');
  const cases = [
    ['_drafts/draft.md', { date: '2026-07-21' }, 'draft path'],
    ['_posts/2026-07-21-draft.md', { date: '2026-07-21', draft: true }, 'draft or unpublished front matter'],
    ['_posts/2026-07-21-hidden.md', { date: '2026-07-21', published: false }, 'draft or unpublished front matter'],
    ['_posts/2026-07-21-opt-out.md', { date: '2026-07-21', social_publish: false }, 'social_publish is false'],
    ['_posts/2026-07-21-breach.md', { date: '2026-07-21', title: 'Company breach analysis' }, 'breach-related content is excluded from automatic publishing'],
    ['_posts/2026-07-23-future.md', { date: '2026-07-23' }, 'future-dated post'],
    ['_posts/2026-07-23-future-filename.md', {}, 'future-dated post'],
  ];
  for (const [filePath, data, reason] of cases) {
    assert.deepEqual(postEligibility({ filePath, data, now }), { eligible: false, reason });
  }
});
