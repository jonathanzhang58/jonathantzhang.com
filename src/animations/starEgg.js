import { gsap } from 'gsap'
import { DUR, EASE } from './motion.js'
import { STAR_POP } from './heroIntro.js'

const FALL_AFTER = 4

// Click state lives on the element itself, so a refresh or a navigation away
// and back recreates the star with a clean slate.
export function handleStarClick(star) {
  if (gsap.isTweening(star)) return
  if (star.dataset.fallen) return reappear(star)

  const spins = (Number(star.dataset.spins) || 0) + 1
  star.dataset.spins = spins
  if (spins >= FALL_AFTER) return fallOff(star)

  gsap.to(star, {
    rotation: '+=360',
    transformOrigin: '50% 50%',
    duration: DUR.pop * 1.8,
    ease: EASE.pop,
  })
}

function fallOff(star) {
  star.dataset.fallen = 'true'
  const drop = window.innerHeight - star.getBoundingClientRect().top + 80

  const tl = gsap.timeline()
  // unscrew: accelerating turns in place, creeping down as the threads let go
  tl.to(star, { rotation: '+=1080', transformOrigin: '50% 50%', duration: 1.5, ease: 'power2.in' })
  tl.to(star, { y: '+=10', duration: 1.5, ease: 'power2.in' }, '<')
  // free: fall away off the bottom of the screen, still spinning
  tl.to(star, { y: drop, duration: 0.9, ease: 'power2.in' }, '>-0.05')
  tl.to(star, { rotation: '+=540', duration: 0.9, ease: 'none' }, '<')
  // park it invisibly back on its spot so the empty space stays clickable
  tl.set(star, { x: 0, y: 0, rotation: 15, opacity: 0 })
}

function reappear(star) {
  delete star.dataset.fallen
  star.dataset.spins = '0'
  gsap.set(star, { clearProps: 'all' })
  gsap.from(star, STAR_POP)
}
