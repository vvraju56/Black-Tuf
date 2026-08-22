export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateOrderNumber = (prefix = 'ORD'): string => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString().slice(2) +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${dateStr}${random}`;
};

export const generateSKU = (): string => {
  const date = new Date();
  const time = date.getTime().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SKU-${time}${random}`;
};

export const calculatePagination = (page: number, limit: number, count: number) => {
  const totalPages = Math.ceil(count / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  return { page, totalPages, total: count, hasNext, hasPrev, limit };
};

export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};


