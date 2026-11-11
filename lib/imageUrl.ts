const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/+$/, '');

/**
 * Resolve an uploaded image path or full URL into a safe browser-loadable URL.
 * Prevents protocol-relative `//api/...` bugs and avoids prefixing absolute `http(s)://` URLs.
 */
export const resolveImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${IMAGE_BASE_URL}${normalizedPath}`;
};

