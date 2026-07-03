import { createRouter } from './router.js'
import { createNav } from './components/nav.js'
import { renderSidebar } from './components/sidebar.js'
import { createSectionIcon } from './components/sectionIcon.js'
import { gridSVG } from './components/motifs.js'

document.getElementById('grid-mount').innerHTML = gridSVG()
renderSidebar(document.getElementById('sidebar'))

const pageEl = document.getElementById('page')
const icon = createSectionIcon(document.getElementById('icon'))
const nav = createNav(document.getElementById('nav'), (path) => router.navigate(path))

const router = createRouter((from, to) => {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  pageEl.innerHTML = to.render()
  icon.set(to.icon)
  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`
})

router.start()
