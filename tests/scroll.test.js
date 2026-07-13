import { describe, it, expect, beforeEach } from 'vitest'
import { setPage } from '../src/animations/pageTransition.js'
import { getPage } from '../src/pages/index.js'

function makeEls() {
  document.body.innerHTML = `
    <aside id="sidebar"></aside>
    <main id="page"></main>
    <div id="icon"></div>
  `
  return {
    page: document.getElementById('page'),
    sidebar: document.getElementById('sidebar'),
    grid: null,
  }
}

const icon = { el: null, set() {} }

describe('page swap scroll reset', () => {
  beforeEach(() => {
    window.scrollTo(0, 500)
  })

  it('setPage scrolls the window back to the top', () => {
    const els = makeEls()
    icon.el = document.getElementById('icon')
    setPage(getPage('/hobbies/modded-minecraft') ?? getPage('/bio'), els, icon)
    expect(window.scrollY).toBe(0)
  })
})
