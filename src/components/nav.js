import { pages } from '../pages/index.js'

export function createNav(el, onNavigate) {
  el.className = 'nav'
  el.innerHTML = `
    <a class="nav-logo" href="/">Y&middot;N</a>
    <nav class="nav-links">
      ${pages.map((p) => `<a href="${p.path}">${p.title}</a>`).join('')}
    </nav>`
  el.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (!a) return
    e.preventDefault()
    onNavigate(a.getAttribute('href'))
  })
  return {
    setActive(path) {
      el.querySelectorAll('.nav-links a').forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === path)
      })
    },
  }
}
