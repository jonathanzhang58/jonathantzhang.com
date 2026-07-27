import { describe, it, expect } from 'vitest'
import { getPage } from '../src/pages/index.js'
import { esc } from '../src/util.js'
import site from '../content/site.yaml'
import research from '../content/research.yaml'
import contact from '../content/contact.yaml'

describe('content propagates from yaml to pages', () => {
  it('hero renders the name lines from site.yaml', () => {
    const html = getPage('/').render()
    for (const line of site.name_lines) expect(html).toContain(line)
    expect(html).toContain(esc(site.affiliation))
  })

  it('research renders every publication', () => {
    const html = getPage('/research').render()
    for (const p of research.publications) expect(html).toContain(p.venue)
  })

  it('underlines a publication title only when it has a link', () => {
    const html = getPage('/research').render()
    for (const p of research.publications) {
      const linked = html.includes(
        `<p class="pub-title pub-title-linked"><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a></p>`,
      )
      const plain = html.includes(`<p class="pub-title">${esc(p.title)}</p>`)
      expect(p.link ? linked : plain).toBe(true)
    }
  })

  it('links a publication note only when note_link is set', () => {
    const html = getPage('/research').render()
    for (const p of research.publications) {
      if (!p.note) continue
      // the note is underlined via `.pub-note a`, so it must be an anchor
      // when note_link is set and bare text when it is not
      if (p.note_link) {
        expect(html).toContain(
          `<a href="${esc(p.note_link)}" target="_blank" rel="noopener">${esc(p.note)}</a>`,
        )
      } else {
        expect(html).toContain(`<p class="pub-meta pub-note u-label">${esc(p.note)}</p>`)
      }
    }
  })

  it('research renders both labs with their projects', () => {
    const html = getPage('/research').render()
    expect(research.labs).toHaveLength(2)
    for (const lab of research.labs) {
      expect(html).toContain(esc(lab.name))
      expect(html).toContain(esc(lab.focus))
      const projects = [...(lab.projects.current ?? []), ...(lab.projects.completed ?? [])]
      for (const p of projects) expect(html).toContain(esc(p.title))
    }
  })

  it('contact renders every link label', () => {
    const html = getPage('/contact').render()
    for (const l of contact.links) expect(html).toContain(l.label)
  })
})
