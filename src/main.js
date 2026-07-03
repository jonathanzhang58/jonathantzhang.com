import { createRouter } from './router.js'
import { createNav } from './components/nav.js'
import { renderSidebar } from './components/sidebar.js'
import { createSectionIcon } from './components/sectionIcon.js'
import { gridSVG } from './components/motifs.js'
import { heroIntro } from './animations/heroIntro.js'
import { transition } from './animations/pageTransition.js'
import { prefersReducedMotion } from './animations/motion.js'
import { initTheme, toggleTheme, getTheme } from './theme.js'

initTheme()
document.getElementById('grid-mount').innerHTML = gridSVG()
renderSidebar(document.getElementById('sidebar'))

const els = {
  page: document.getElementById('page'),
  sidebar: document.getElementById('sidebar'),
  grid: document.getElementById('grid-mount'),
}
const icon = createSectionIcon(document.getElementById('icon'))
const nav = createNav(document.getElementById('nav'), (path) => router.navigate(path), toggleTheme)
nav.setThemeIcon(getTheme())

let activeTl = null

function renderInstant(to) {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  els.page.innerHTML = to.render()
  icon.set(to.icon)
}

const router = createRouter((from, to) => {
  // Force-complete any running transition: progress(1, false) fires the pending
  // swap/spawn callbacks (suppressEvents must be off), which may hand us a
  // freshly spawned incoming timeline via onSpawn - finish that one too.
  const pending = activeTl
  activeTl = null
  if (pending) {
    pending.progress(1, false)
    pending.kill()
    if (activeTl) {
      activeTl.progress(1, false)
      activeTl.kill()
      activeTl = null
    }
  }

  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`

  if (!from || prefersReducedMotion()) {
    renderInstant(to)
    if (!from && to.path === '/' && !prefersReducedMotion()) activeTl = heroIntro()
    return
  }

  activeTl = transition({ from, to, els, icon, onSpawn: (inTl) => { activeTl = inTl } })
})

router.start()
