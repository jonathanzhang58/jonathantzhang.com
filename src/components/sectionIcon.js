const ICONS = {
  star: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <path d="M50 6 L57 43 L94 50 L57 57 L50 94 L43 57 L6 50 L43 43 Z"/></svg>`,
  smiley: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
    <circle cx="50" cy="50" r="38"/>
    <circle cx="37" cy="42" r="2.5" fill="currentColor"/>
    <circle cx="63" cy="42" r="2.5" fill="currentColor"/>
    <path d="M34 60 Q50 74 66 60"/></svg>`,
  atom: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
    <ellipse cx="50" cy="50" rx="40" ry="16"/>
    <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(60 50 50)"/>
    <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(120 50 50)"/>
    <circle cx="50" cy="50" r="5" fill="currentColor" stroke="none"/></svg>`,
  cube: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <path d="M50 8 L88 29 L88 71 L50 92 L12 71 L12 29 Z"/>
    <path d="M12 29 L50 50 L88 29 M50 50 L50 92"/></svg>`,
  document: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <path d="M26 8 H62 L78 24 V92 H26 Z"/>
    <path d="M62 8 V24 H78"/>
    <path d="M36 42 H68 M36 54 H68 M36 66 H56"/></svg>`,
  controller: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <rect x="10" y="34" width="80" height="34" rx="17"/>
    <path d="M32 44 V58 M25 51 H39"/>
    <circle cx="66" cy="47" r="3" fill="currentColor" stroke="none"/>
    <circle cx="75" cy="55" r="3" fill="currentColor" stroke="none"/></svg>`,
  plane: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <path d="M8 50 L92 14 L64 86 L48 60 Z"/>
    <path d="M92 14 L48 60"/></svg>`,
}

export function createSectionIcon(el) {
  let currentId = null
  return {
    set(id) {
      el.innerHTML = ICONS[id] ?? ''
      currentId = id
    },
    get current() {
      return currentId
    },
    el,
  }
}
