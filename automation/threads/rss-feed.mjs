import { cleanSummary, isBreachRelated } from './threads-lib.mjs';

function decodeXml(value) {
  return String(value || '')
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function elementValue(block, name) {
  const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

export function parseRssFeed(xml) {
  if (!/<rss\b/i.test(xml) || !/<channel\b/i.test(xml)) {
    throw new Error('Expected an RSS channel');
  }
  const blocks = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  if (blocks.length === 0) throw new Error('RSS feed contains no items');

  return blocks.map((block) => {
    const url = elementValue(block, 'link');
    const guid = elementValue(block, 'guid') || url;
    const categories = [...block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)]
      .map((match) => decodeXml(match[1].trim()));
    const item = {
      title: cleanSummary(elementValue(block, 'title')),
      description: cleanSummary(elementValue(block, 'description')),
      pubDate: elementValue(block, 'pubDate'),
      url,
      guid,
      categories,
    };
    if (!item.title || !item.url || !item.guid) {
      throw new Error('RSS item is missing a title, URL, or GUID');
    }
    return item;
  });
}

export function rssItemEligibility(item, now = new Date()) {
  const publishedAt = new Date(item.pubDate);
  if (!item.pubDate || Number.isNaN(publishedAt.getTime())) {
    return { eligible: false, reason: 'missing or invalid RSS publication date' };
  }
  if (publishedAt.getTime() > now.getTime()) {
    return { eligible: false, reason: 'future-dated RSS item' };
  }
  const safetyText = [item.title, item.description, ...item.categories].join(' ');
  if (isBreachRelated(safetyText)) {
    return { eligible: false, reason: 'breach-related content is excluded from automatic publishing' };
  }
  return { eligible: true, reason: 'published RSS item' };
}

export function unseenRssItems(items, lastGuid) {
  if (!lastGuid) return [];
  const lastIndex = items.findIndex((item) => item.guid === lastGuid);
  if (lastIndex === -1) {
    throw new Error('Saved RSS GUID is no longer present in the feed; refusing to backfill posts');
  }
  return items.slice(0, lastIndex).reverse();
}
