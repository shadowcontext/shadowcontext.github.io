import path from 'node:path';

export const THREADS_CHARACTER_LIMIT = 500;

function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if ((character === '"' || character === "'") && value[index - 1] !== '\\') {
      quote = quote === character ? null : (quote || character);
      continue;
    }
    if (character === '#' && quote === null && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function parseScalar(value) {
  const trimmed = stripInlineComment(value).trim();
  if (!trimmed) return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter((item) => item !== '');
  }
  return trimmed;
}

export function parseFrontMatter(source) {
  const normalized = source.replaceAll('\r\n', '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: {}, content: normalized };
  }

  const closingIndex = normalized.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    throw new Error('Front matter is missing its closing delimiter');
  }

  const block = normalized.slice(4, closingIndex);
  const lines = block.split('\n');
  const data = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#') || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) continue;

    const [, key, rawValue = ''] = match;
    if (rawValue === '|' || rawValue === '>') {
      const parts = [];
      while (index + 1 < lines.length && (/^\s/.test(lines[index + 1]) || !lines[index + 1].trim())) {
        index += 1;
        parts.push(lines[index].replace(/^ {1,4}/, ''));
      }
      data[key] = rawValue === '>' ? parts.join(' ').replace(/\s+/g, ' ').trim() : parts.join('\n').trim();
    } else {
      data[key] = parseScalar(rawValue);
    }
  }

  return { data, content: normalized.slice(closingIndex + 5) };
}

export function parseSiteConfig(source) {
  const data = {};
  for (const line of source.replaceAll('\r\n', '\n').split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#') || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (match) data[match[1]] = parseScalar(match[2] ?? '');
  }
  return data;
}

function normalizeDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  let normalized = value.trim();
  normalized = normalized.replace(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{2})(\d{2})$/,
    '$1T$2$3:$4',
  );
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function filenameDate(filePath) {
  const match = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})-/);
  return match ? new Date(`${match[1]}T00:00:00Z`) : null;
}

export function postEligibility({ filePath, data, now = new Date() }) {
  const normalizedPath = filePath.replaceAll('\\', '/');
  if (normalizedPath.includes('/_drafts/') || normalizedPath.startsWith('_drafts/')) {
    return { eligible: false, reason: 'draft path' };
  }
  if (!normalizedPath.startsWith('_posts/')) {
    return { eligible: false, reason: 'not a published post path' };
  }
  if (data.draft === true || data.published === false) {
    return { eligible: false, reason: 'draft or unpublished front matter' };
  }
  if (data.social_publish === false) {
    return { eligible: false, reason: 'social_publish is false' };
  }
  const safetyText = [
    data.title,
    data.description,
    data.summary,
    data.excerpt,
    data.category,
    ...(Array.isArray(data.tags) ? data.tags : []),
  ].filter(Boolean).join(' ');
  if (isBreachRelated(safetyText)) {
    return { eligible: false, reason: 'breach-related content is excluded from automatic publishing' };
  }

  const rawDate = data.date ?? filenameDate(filePath);
  const publishDate = normalizeDate(rawDate);
  if (!publishDate) return { eligible: false, reason: 'missing or invalid publish date' };
  if (publishDate.getTime() > now.getTime()) return { eligible: false, reason: 'future-dated post' };
  return { eligible: true, reason: 'published post' };
}

export function isBreachRelated(value) {
  return /\bbreach(?:ed|es|ing)?\b|\bdata\s+leak/i.test(String(value || ''));
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function canonicalPostUrl({ filePath, data, siteConfig }) {
  const siteUrl = String(siteConfig.url || '').replace(/\/$/, '');
  if (!siteUrl) throw new Error('The Jekyll site URL is missing from _config.yml');

  const basename = path.basename(filePath, path.extname(filePath));
  const filenameMatch = basename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!filenameMatch) throw new Error(`Post filename does not follow Jekyll's dated format: ${filePath}`);
  const [, year, month, day, filenameSlug] = filenameMatch;
  const titleSlug = slugify(data.slug || filenameSlug);
  const categories = Array.isArray(data.categories)
    ? data.categories.map(slugify).join('/')
    : slugify(data.category || '');
  const template = String(data.permalink || siteConfig.permalink || '/:categories/:year/:month/:day/:title:output_ext');
  const replacements = {
    categories,
    year,
    month,
    day,
    title: titleSlug,
    slug: titleSlug,
    output_ext: '.html',
  };
  let publicPath = template.replace(/:([a-z_]+)/g, (token, key) => replacements[key] ?? token);
  publicPath = publicPath.replace(/\/+/g, '/');
  if (!publicPath.startsWith('/')) publicPath = `/${publicPath}`;

  const baseurl = String(siteConfig.baseurl || '').replace(/^\/+|\/+$/g, '');
  if (baseurl && !publicPath.startsWith(`/${baseurl}/`)) publicPath = `/${baseurl}${publicPath}`;
  return new URL(publicPath, `${siteUrl}/`).toString();
}

export function cleanSummary(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function postSummary(data) {
  return cleanSummary(data.description || data.summary || data.excerpt || '');
}

function characters(value) {
  return Array.from(value);
}

function truncate(value, limit) {
  const points = characters(value);
  if (points.length <= limit) return value;
  if (limit <= 1) return '…'.slice(0, Math.max(0, limit));
  return `${points.slice(0, limit - 1).join('').trimEnd()}…`;
}

export function buildThreadsText({ title, description = '', url, limit = THREADS_CHARACTER_LIMIT }) {
  const cleanTitle = cleanSummary(title);
  const cleanDescription = cleanSummary(description);
  if (!cleanTitle) throw new Error('A post title is required');
  if (!url) throw new Error('A canonical post URL is required');

  const separator = '\n\n';
  const fullPrefix = cleanDescription ? `${cleanTitle}${separator}${cleanDescription}` : cleanTitle;
  const available = limit - characters(url).length - characters(separator).length;
  if (available < 2) throw new Error('The canonical URL is too long for a Threads post');
  const prefix = truncate(fullPrefix, available);
  return `${prefix}${separator}${url}`;
}

export function characterCount(value) {
  return characters(value).length;
}
