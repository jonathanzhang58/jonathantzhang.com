import { describe, it, expect } from 'vitest'
import { pages, getPage } from '../src/pages/index.js'

describe('page registry', () => {
  it('has the 7 pages in nav order', () => {
    expect(pages.map((p) => p.title)).toEqual([
      'Home', 'Bio', 'Research', 'Projects', 'CV', 'Hobbies', 'Contact',
    ])
  })

  it('every page has path, title, icon, and render()', () => {
    const iconIds = ['star', 'smiley', 'atom', 'cube', 'document', 'controller', 'plane']
    pages.forEach((p, i) => {
      expect(p.path).toMatch(/^\//)
      expect(p.icon).toBe(iconIds[i])
      expect(typeof p.render()).toBe('string')
      expect(p.render().length).toBeGreaterThan(0)
    })
  })

  it('getPage resolves known paths and returns null for unknown', () => {
    expect(getPage('/').title).toBe('Home')
    expect(getPage('/bio').title).toBe('Bio')
    expect(getPage('/nope')).toBeNull()
  })

  it('home hero has fly-in markers and motifs', () => {
    const html = getPage('/').render()
    expect(html).toContain('data-fly="left"')
    expect(html).toContain('data-fly="right"')
    expect(html).toContain('class="emph"')
    expect(html).toContain('class="star5"')
  })
})
