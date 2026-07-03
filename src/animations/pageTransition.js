import { gsap } from 'gsap'
import { DUR, EASE } from './motion.js'
import { heroIntro } from './heroIntro.js'
import { pages } from '../pages/index.js'

// +1 = spin right (navigating to a later nav item), -1 = spin left
export function flipDirection(from, to) {
  return pages.indexOf(to) >= pages.indexOf(from) ? 1 : -1
}

function setPage(to, els, icon) {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  els.page.innerHTML = to.render()
  icon.set(to.icon)
  gsap.set('.grid-line', { clearProps: 'all' })
  gsap.set(els.sidebar, { clearProps: 'all' })
}

// Builds the outgoing half up front (targets exist now). Incoming tweens are
// spawned inside a callback AFTER the DOM swap - GSAP resolves targets at tween
// creation, so building them earlier would bind to the old page's elements.
// The spawned timeline is reported via onSpawn so the caller can track/kill it.
export function transition({ from, to, els, icon, onSpawn }) {
  const tl = gsap.timeline()
  const vw = window.innerWidth
  const fromHome = from.path === '/'
  const toHome = to.path === '/'
  const dir = flipDirection(from, to)

  gsap.set(icon.el, { transformPerspective: 800 })

  /* -- outgoing -- */
  if (fromHome) {
    // grid lines fly away, hero collapses toward the sidebar (up-left, shrinking)
    tl.to('.grid-line', {
      x: (i) => (i % 2 ? vw : -vw) * 0.7,
      opacity: 0,
      duration: DUR.page,
      ease: EASE.out,
      stagger: 0.04,
    }, 0)
    tl.to('[data-fly], .emph, .star4', {
      x: -vw * 0.3,
      y: -40,
      scale: 0.7,
      opacity: 0,
      transformOrigin: '0 0',
      duration: DUR.page,
      ease: EASE.out,
      stagger: 0.04,
    }, 0)
  } else {
    tl.to([...els.page.children], {
      x: (toHome ? 1 : -1) * vw * 0.25,
      opacity: 0,
      duration: DUR.page,
      ease: EASE.out,
    }, 0)
    if (toHome) {
      tl.to(els.sidebar, {
        x: -(els.sidebar.offsetWidth + 40),
        opacity: 0,
        duration: DUR.page,
        ease: EASE.out,
      }, 0)
    }
  }

  /* -- icon flip out (toward the nav direction) -- */
  tl.to(icon.el, { rotationY: dir * 90, duration: DUR.flip / 2, ease: 'power2.in' }, 0)

  /* -- swap DOM, then spawn the incoming timeline against the fresh DOM -- */
  tl.add(() => {
    setPage(to, els, icon)
    // re-enter from the opposite side so the flip reads as one continuous spin
    gsap.set(icon.el, { rotationY: -dir * 90 })

    const inTl = gsap.timeline()
    if (toHome) {
      inTl.add(heroIntro().timeScale(1.4))
    } else {
      if (fromHome) {
        inTl.from(els.sidebar, {
          x: -(els.sidebar.offsetWidth || 340) - 40,
          opacity: 0,
          duration: DUR.page,
          ease: EASE.page,
        }, 0)
      }
      inTl.from([...els.page.children], {
        x: vw * 0.25,
        opacity: 0,
        duration: DUR.page,
        ease: EASE.page,
      }, fromHome ? 0.05 : 0)
    }
    onSpawn?.(inTl)
  })

  /* -- icon flip in (parallel with the spawned incoming timeline) -- */
  tl.to(icon.el, { rotationY: 0, duration: DUR.flip / 2, ease: 'power2.out' })

  return tl
}
