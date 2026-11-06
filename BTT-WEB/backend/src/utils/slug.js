import { cleanText } from './text.js';

export function slugify(value) {
  return cleanText(value, 160)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Return a slug that does not collide with an existing document.
 * `model` may be any Mongoose model with a unique `slug` field.
 */
export async function uniqueSlug(model, desired, excludeId = null) {
  const base = slugify(desired) || 'item';
  let candidate = base;
  let counter = 2;

  for (;;) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await model.exists(query);
    if (!exists) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
