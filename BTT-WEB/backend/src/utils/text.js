/**
 * Text cleaning helpers.
 *
 * All stored content is treated as plain text. Public rendering always goes
 * through React's escaping, so the goal here is to keep the database free of
 * markup and control characters rather than to preserve any HTML.
 */

const NAMED_ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
};

function decodeEntities(value) {
  return value.replace(/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/gi, (entity) => {
    const named = NAMED_ENTITIES[entity.toLowerCase()];
    if (named !== undefined) return named;
    if (entity.startsWith('&#x') || entity.startsWith('&#X')) {
      const code = Number.parseInt(entity.slice(3, -1), 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    }
    if (entity.startsWith('&#')) {
      const code = Number.parseInt(entity.slice(2, -1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    }
    return entity;
  });
}

/** Strip all markup and unsafe control characters from a single-line value. */
export function cleanText(value, maxLength = 20000) {
  if (value === null || value === undefined) return '';
  let text = String(value).replace(/\u0000/g, '');

  // Remove script/style blocks together with their contents.
  text = text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');

  // Remove every remaining opening, closing, or self-closing tag. A literal
  // less-than sign followed by a space (for example "a < b") is preserved.
  text = text.replace(/<\/?[a-z][^>]*>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  text = decodeEntities(text);

  // Collapse control characters except newlines and tabs.
  text = text.replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');

  return text.trim().slice(0, maxLength);
}

/** Keep paragraph breaks for long-form plain-text descriptions. */
export function cleanMultiline(value, maxLength = 20000) {
  return cleanText(value, maxLength)
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n');
}

export function cleanUrl(value) {
  const url = cleanText(value, 500);
  if (!url) return '';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
  } catch {
    return '';
  }
}
