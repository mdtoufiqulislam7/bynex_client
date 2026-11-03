/** Full-size logo (nav, etc.) */
export const SITE_LOGO_URL = '/android-chrome-512x512.png'

/**
 * Same asset, with a cache-bust query so browsers & CDNs refetch after you change the logo.
 * Bump FAVICON_VERSION when you replace the image (or production may keep the old tab icon).
 */
const FAVICON_VERSION = '3'

function withIconCacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}fv=${FAVICON_VERSION}`
}

/** Use for `metadata.icons` / `<link rel="icon">` only */
export const FAVICON_URL = withIconCacheBust('/icon.svg')
