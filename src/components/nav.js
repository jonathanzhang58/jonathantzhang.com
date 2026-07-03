import { gsap } from 'gsap'
import { pages } from '../pages/index.js'
import { prefersReducedMotion } from '../animations/motion.js'

export function createNav(el, onNavigate, onToggleTheme) {
  el.className = 'nav'
  el.innerHTML = `
    <a class="nav-logo" href="/">Y&middot;N</a>
    <div class="nav-right">
      <nav class="nav-links">
        ${pages.map((p) => `<a href="${p.path}">${p.title}</a>`).join('')}
      </nav>
      <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M20 14 A8.5 8.5 0 1 1 10 4 A7 7 0 0 0 20 14 Z"/>
        </svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="4.5"/>
          <path d="M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22 M4.9 4.9 L6.3 6.3 M17.7 17.7 L19.1 19.1 M4.9 19.1 L6.3 17.7 M17.7 6.3 L19.1 4.9"/>
        </svg>
      </button>
    </div>`

  const sun = el.querySelector('.icon-sun')
  const moon = el.querySelector('.icon-moon')
  let iconTl = null

  // The icon shows the CURRENT mode: sun in light, moon in dark. On toggle the
  // outgoing icon rotates away along a radial arc (origin far below center, so
  // it sets like a sun below the horizon) while the incoming one rotates up.
  function setThemeIcon(theme, { animate = false } = {}) {
    const show = theme === 'light' ? sun : moon
    const hide = theme === 'light' ? moon : sun
    if (iconTl) {
      iconTl.kill()
      iconTl = null
    }
    if (!animate || prefersReducedMotion()) {
      gsap.set(hide, { autoAlpha: 0 })
      gsap.set(show, { autoAlpha: 1, rotation: 0 })
      return
    }
    const origin = '50% 280%'
    iconTl = gsap.timeline()
      .to(hide, {
        rotation: 120,
        autoAlpha: 0,
        transformOrigin: origin,
        duration: 0.4,
        ease: 'power2.in',
      }, 0)
      .fromTo(show,
        { rotation: -120, autoAlpha: 0, transformOrigin: origin },
        { rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' },
      0.15)
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) {
      const next = onToggleTheme?.()
      if (next) setThemeIcon(next, { animate: true })
      return
    }
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
    setThemeIcon,
  }
}
