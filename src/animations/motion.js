export const DUR = { fly: 0.7, grid: 0.9, pop: 0.5, page: 0.45, flip: 0.6 }

export const EASE = {
  fly: 'power3.out',
  out: 'power2.in',
  page: 'power2.out',
  pop: 'back.out(2.4)',
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
