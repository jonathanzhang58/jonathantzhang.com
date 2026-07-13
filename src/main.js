import { createRouter } from './router.js'
import { createNav } from './components/nav.js'
import { renderSidebar } from './components/sidebar.js'
import { createSectionIcon } from './components/sectionIcon.js'
import { gridSVG } from './components/motifs.js'
import { heroIntro } from './animations/heroIntro.js'
import { transition } from './animations/pageTransition.js'
import { prefersReducedMotion } from './animations/motion.js'
import { handleStarClick } from './animations/starEgg.js'
import { initTheme, toggleTheme, getTheme } from './theme.js'
import site from '../content/site.yaml'

const siteName = site.name_lines.join(' ')

// every page swap lands at the top; without this the browser re-applies the
// old offset on back/forward and fights the reset in renderInstant/setPage
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

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
  window.scrollTo(0, 0)
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

  // detail pages highlight their parent section in the nav
  nav.setActive(to.parent ?? to.path)
  document.title = to.path === '/' ? siteName : `${to.title} — ${siteName}`

  if (!from || prefersReducedMotion()) {
    renderInstant(to)
    if (!from && to.path === '/' && !prefersReducedMotion()) activeTl = heroIntro()
    return
  }

  activeTl = transition({ from, to, els, icon, onSpawn: (inTl) => { activeTl = inTl } })
})

// In-page internal links (clickable cards, detail back buttons) route through
// the SPA router instead of a full page load. #page persists across swaps.
els.page.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-nav]')
  if (!a) return
  e.preventDefault()
  router.navigate(a.getAttribute('href'))
})

// Easter egg: the star by the name spins on click; four clicks unscrew it,
// and clicking the empty spot pops it back in.
els.page.addEventListener('click', (e) => {
  const star = e.target.closest('.star5')
  if (!star || prefersReducedMotion()) return
  handleStarClick(star)
})

router.start()
