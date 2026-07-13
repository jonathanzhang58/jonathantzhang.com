import { describe, it, expect } from 'vitest'
import { cardHTML } from '../src/pages/projects.js'

describe('project cards', () => {
  const base = { title: 'Thing', blurb: 'About the thing.', image: '' }

  it('link only: whole tile links out, title underlined, no read-more', () => {
    const html = cardHTML({ ...base, link: 'https://x.com' }, '/projects')
    expect(html).toContain('card-clickable')
    expect(html).toContain('href="https://x.com"')
    expect(html).toContain('card-title-linked')
    expect(html).not.toContain('card-more')
  })

  it('page only: static tile, read-more alone routes to the detail page', () => {
    const html = cardHTML({ ...base, page: ['story'] }, '/projects')
    expect(html).not.toContain('card-clickable')
    expect(html).not.toContain('card-title-linked')
    expect(html).toContain('class="card-more" href="/projects/thing"')
  })

  it('link and page: tile goes to the link, read-more to the detail page', () => {
    const html = cardHTML({ ...base, link: 'https://x.com', page: ['story'] }, '/projects')
    expect(html).toContain('class="card-link" href="https://x.com"')
    expect(html).toContain('class="card-more" href="/projects/thing"')
    // read-more must not be nested inside the external-link anchor
    const linkEnd = html.indexOf('</a>')
    expect(html.indexOf('card-more')).toBeGreaterThan(linkEnd)
  })

  it('neither: fully static card', () => {
    const html = cardHTML(base, '/projects')
    expect(html).not.toContain('card-clickable')
    expect(html).not.toContain('<a')
  })
})
