import { getPage } from './pages/index.js'

export function createRouter(onChange) {
  let current = null

  function apply(path, { replace = false, push = true } = {}) {
    const page = getPage(path) ?? getPage('/')
    if (current && page.path === current.path) return
    if (replace) history.replaceState({}, '', page.path)
    else if (push) history.pushState({}, '', page.path)
    const from = current
    current = page
    onChange(from, page)
  }

  window.addEventListener('popstate', () => apply(location.pathname, { push: false }))

  return {
    start: () => apply(location.pathname, { replace: true }),
    navigate: (path) => apply(path),
    get current() {
      return current
    },
  }
}
