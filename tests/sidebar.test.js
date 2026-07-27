import { describe, it, expect, beforeAll } from 'vitest'
import { renderSidebar } from '../src/components/sidebar.js'
import site from '../content/site.yaml'

describe('sidebar social links', () => {
  let anchors

  beforeAll(() => {
    const el = document.createElement('div')
    renderSidebar(el)
    anchors = [...el.querySelectorAll('a.sidebar-social')]
  })

  it('renders one anchor per social with a url', () => {
    expect(anchors).toHaveLength(site.socials.filter((s) => s.url).length)
  })

  it('keeps absolute urls intact instead of making them site-relative', () => {
    for (const s of site.socials.filter((s) => /^https?:\/\//i.test(s.url))) {
      const a = anchors.find((a) => a.textContent === s.label)
      expect(a.getAttribute('href')).toBe(s.url)
      // the old bug produced href="/https://..." which resolves to this site
      expect(a.getAttribute('href')).not.toMatch(/^\//)
      expect(a.getAttribute('target')).toBe('_blank')
    }
  })

  it('anchors relative urls to the site root so they work from nested routes', () => {
    for (const s of site.socials.filter((s) => s.url && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(s.url))) {
      const a = anchors.find((a) => a.textContent === s.label)
      expect(a.getAttribute('href')).toBe('/' + s.url.replace(/^\//, ''))
      expect(a.getAttribute('target')).toBeNull()
    }
  })
})
