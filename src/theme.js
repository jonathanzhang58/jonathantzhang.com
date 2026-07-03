const KEY = 'theme'

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
}

export function initTheme() {
  const saved = localStorage.getItem(KEY)
  if (saved === 'dark' || saved === 'light') {
    apply(saved)
    return
  }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  apply(systemDark ? 'dark' : 'light')
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  apply(next)
  localStorage.setItem(KEY, next)
}
