import { describe, it, expect } from 'vitest'
import { getPage } from '../src/pages/index.js'
import site from '../content/site.yaml'
import research from '../content/research.yaml'
import contact from '../content/contact.yaml'

describe('content propagates from yaml to pages', () => {
  it('hero renders the name lines from site.yaml', () => {
    const html = getPage('/').render()
    for (const line of site.name_lines) expect(html).toContain(line)
    expect(html).toContain(site.affiliation)
  })

  it('research renders every publication', () => {
    const html = getPage('/research').render()
    for (const p of research.publications) expect(html).toContain(p.venue)
  })

  it('contact renders every link label', () => {
    const html = getPage('/contact').render()
    for (const l of contact.links) expect(html).toContain(l.label)
  })
})
