import { gsap } from 'gsap'
import { DUR, EASE } from './motion.js'

export function heroIntro() {
  const tl = gsap.timeline()
  const vw = window.innerWidth

  tl.from('.grid-line', {
    x: (i) => (i % 2 ? vw : -vw) * 0.7,
    y: (i) => (i % 2 ? -vw : vw) * 0.5,
    opacity: 0,
    duration: DUR.grid,
    ease: EASE.fly,
    stagger: 0.08,
  }, 0)

  tl.from('[data-fly]', {
    x: (i, el) => (el.dataset.fly === 'left' ? -1 : 1) * vw * 0.7,
    opacity: 0,
    duration: DUR.fly,
    ease: EASE.fly,
    stagger: 0.12,
  }, 0.15)

  tl.from('.emph-line', {
    scale: 0,
    transformOrigin: '100% 100%',
    duration: DUR.pop,
    ease: EASE.pop,
    stagger: 0.07,
  }, '>-0.1')

  tl.from('.star5', {
    scale: 0,
    rotation: 120,
    transformOrigin: '50% 50%',
    duration: DUR.pop,
    ease: EASE.pop,
  }, '<0.1')

  tl.from('.section-icon', {
    opacity: 0,
    scale: 0.85,
    duration: 0.6,
    ease: EASE.page,
  }, '<')

  return tl
}
