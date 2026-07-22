import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRssFeed, rssItemEligibility, unseenRssItems } from './rss-feed.mjs';

const feed = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Newest &amp; safest</title>
    <description>&lt;p&gt;Useful &quot;analysis&quot;.&lt;/p&gt;</description>
    <pubDate>Wed, 22 Jul 2026 12:00:00 +0000</pubDate>
    <link>https://example.com/newest/</link>
    <guid>newest-id</guid>
    <category>defense</category>
  </item>
  <item>
    <title>Previous post</title>
    <description>Previous summary.</description>
    <pubDate>Wed, 22 Jul 2026 11:00:00 +0000</pubDate>
    <link>https://example.com/previous/</link>
    <guid>previous-id</guid>
  </item>
  <item>
    <title>Known post</title>
    <description>Known summary.</description>
    <pubDate>Wed, 22 Jul 2026 10:00:00 +0000</pubDate>
    <link>https://example.com/known/</link>
    <guid>known-id</guid>
  </item>
</channel></rss>`;

test('parses RSS items, entities, descriptions, URLs, and categories', () => {
  const items = parseRssFeed(feed);
  assert.equal(items.length, 3);
  assert.deepEqual(items[0], {
    title: 'Newest & safest',
    description: 'Useful "analysis".',
    pubDate: 'Wed, 22 Jul 2026 12:00:00 +0000',
    url: 'https://example.com/newest/',
    guid: 'newest-id',
    categories: ['defense'],
  });
});

test('returns unseen RSS items oldest-first', () => {
  const unseen = unseenRssItems(parseRssFeed(feed), 'known-id');
  assert.deepEqual(unseen.map((item) => item.guid), ['previous-id', 'newest-id']);
});

test('refuses to backfill when saved state is outside the feed window', () => {
  assert.throws(() => unseenRssItems(parseRssFeed(feed), 'missing-id'), /refusing to backfill/);
});

test('skips future-dated and breach-related RSS items', () => {
  const now = new Date('2026-07-22T12:30:00Z');
  assert.deepEqual(
    rssItemEligibility({ ...parseRssFeed(feed)[0], pubDate: 'Wed, 22 Jul 2026 13:00:00 +0000' }, now),
    { eligible: false, reason: 'future-dated RSS item' },
  );
  assert.deepEqual(
    rssItemEligibility({ ...parseRssFeed(feed)[0], title: 'Organization breach report' }, now),
    { eligible: false, reason: 'breach-related content is excluded from automatic publishing' },
  );
});
