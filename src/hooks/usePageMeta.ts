import { useEffect } from 'react'
import { SITE_URL } from '@/lib/siteMeta'

interface PageMeta {
  /** Full document title, e.g. "Pricing — MakeFrame". */
  title: string
  /** Meta description; also mirrored to og:description / twitter:description. */
  description?: string
  /** Route path ("/pricing") used for the canonical URL and og:url. */
  path?: string
  /** Ask crawlers not to index (404s, auth-only screens). */
  noIndex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Per-route document metadata for the SPA. The static defaults live in
 * index.html (which is what link-preview crawlers see); this hook keeps
 * title/description/canonical in sync as the user navigates.
 */
export function usePageMeta({ title, description, path, noIndex }: PageMeta) {
  useEffect(() => {
    document.title = title
    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'twitter:title', title)

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
      upsertMeta('name', 'twitter:description', description)
    }

    if (path !== undefined) {
      const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
      upsertCanonical(canonical)
      upsertMeta('property', 'og:url', canonical)
    }

    if (noIndex) {
      upsertMeta('name', 'robots', 'noindex')
    } else {
      removeMeta('name', 'robots')
    }
  }, [title, description, path, noIndex])
}
