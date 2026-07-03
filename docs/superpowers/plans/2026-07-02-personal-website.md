# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playful Swiss-geometric personal website as a Vite + vanilla JS SPA where a fixed top nav swaps between 7 pages with GSAP-animated transitions, a persistent identity sidebar, and a flipping section icon.

**Architecture:** A static shell (`index.html`) holds persistent mounts (nav, sidebar, section icon, grid backdrop, page container). A hand-rolled History-API router resolves paths to page modules and fires an `onChange(from, to)` callback; `main.js` reacts by building GSAP timelines (hero intro on first Home load, collapse/expand/slide transitions on navigation). Pages know nothing about animation; the animator consumes page metadata (`icon`, `title`).

**Tech Stack:** Vite, vanilla JS (ES modules), plain CSS, GSAP 3, Vitest + happy-dom for unit tests, Vercel static hosting (SPA rewrite).

**Spec:** `docs/superpowers/specs/2026-07-02-personal-website-design.md` — read it before starting.

## Global Constraints

- Colors, verbatim from spec: bg `#FDFDFC`, ink `#17181C`, secondary `#43454D`, accent cobalt `#1440C8`, grid line `#D4D5DA`.
- Typography: Arial/Helvetica system stack only. Name: uppercase, weight 800, letter-spacing −0.035em, ~68px desktop. Kicker: exactly `Hello! I'm ↓` displayed uppercase, 13px, weight 700, letter-spacing 0.22em, **44px gap below it**. Titles: 11.5px uppercase, letter-spacing 0.16em, cobalt. Nav: 11px uppercase, letter-spacing 0.14em.
- Generous vertical spacing between stacked text elements (user preference — err roomy).
- Pages in nav order: Home `/`, Bio `/bio`, Research `/research`, Projects `/projects`, CV `/cv`, Hobbies `/hobbies`, Contact `/contact`.
- Icons per page: Home=star, Bio=smiley, Research=atom, Projects=cube, CV=document, Hobbies=controller, Contact=plane.
- Animations: transform/opacity only (no layout-triggering properties). All animation through GSAP timelines.
- `prefers-reduced-motion: reduce` → instant renders, no fly-ins/flips.
- All text/images are placeholders.
- Unknown routes redirect to `/`. Direct load on a non-home URL skips the hero intro.
- Windows dev machine; commands below are shell-agnostic single commands.

---

### Task 1: Project scaffold and design tokens

**Files:**
- Create: `package.json` (via npm), `vite.config.js`, `.gitignore`, `index.html`, `styles/tokens.css`, `styles/base.css`, `styles/layout.css`, `styles/pages.css`, `src/main.js`

**Interfaces:**
- Produces: mount elements later tasks rely on — `#nav`, `#grid-mount`, `#sidebar`, `#page`, `#icon`; CSS custom properties `--bg --ink --ink-2 --accent --accent-soft --line --font --nav-h --sidebar-w --space-1..5`; utility class `.u-label`.

- [ ] **Step 1: Init npm and install dependencies**

```bash
npm init -y
npm install gsap
npm install -D vite vitest happy-dom
```

- [ ] **Step 2: Configure package.json scripts and module type**

Edit `package.json` — set these fields (keep npm-generated version numbers in dependencies):

```json
{
  "name": "personal-website",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Create config and ignore files**

`vite.config.js`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

`.gitignore`:

```
node_modules/
dist/
```

- [ ] **Step 4: Create index.html shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Name</title>
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/base.css">
  <link rel="stylesheet" href="/styles/layout.css">
  <link rel="stylesheet" href="/styles/pages.css">
</head>
<body data-page="home">
  <div id="grid-mount" aria-hidden="true"></div>
  <header id="nav"></header>
  <div class="layout">
    <aside id="sidebar" class="sidebar"></aside>
    <main id="page" class="page"></main>
  </div>
  <div id="icon" class="section-icon" aria-hidden="true"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create styles/tokens.css**

```css
:root {
  --bg: #fdfdfc;
  --ink: #17181c;
  --ink-2: #43454d;
  --accent: #1440c8;
  --accent-soft: #dbe2f7;
  --line: #d4d5da;
  --font: Arial, Helvetica, sans-serif;
  --nav-h: 64px;
  --sidebar-w: 300px;
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 28px;
  --space-4: 44px;
  --space-5: 72px;
}
```

- [ ] **Step 6: Create styles/base.css**

```css
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
  min-height: 100vh;
  overflow-x: hidden;
}
h1, h2, h3, p, ul { margin: 0; }
ul { padding: 0; list-style: none; }
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.u-label {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11.5px;
  font-weight: 700;
}
```

- [ ] **Step 7: Create empty styles/layout.css and styles/pages.css**

Both files, same single line for now (filled in Task 5):

```css
/* filled in by Task 5 */
```

- [ ] **Step 8: Create src/main.js stub**

```js
document.getElementById('page').innerHTML = '<p>shell ok</p>'
```

- [ ] **Step 9: Verify dev server**

Run: `npm run dev` — open http://localhost:5173

Expected: blank near-white page showing "shell ok", no console errors, all four stylesheets load (Network tab, 200s). Stop the server.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite project with design tokens and shell"
```

---

### Task 2: Motifs, page modules, and registry (TDD)

**Files:**
- Create: `src/components/motifs.js`, `src/pages/home.js`, `src/pages/bio.js`, `src/pages/research.js`, `src/pages/projects.js`, `src/pages/cv.js`, `src/pages/hobbies.js`, `src/pages/contact.js`, `src/pages/index.js`
- Test: `tests/pages.test.js`

**Interfaces:**
- Produces: `pages` (array of 7 page objects in nav order) and `getPage(path) -> page | null` from `src/pages/index.js`. Every page object: `{ path: string, title: string, icon: string, render(): string }`. Motif helpers `gridSVG()`, `emphasisSVG()`, `starSVG()` from `src/components/motifs.js`, each returning an SVG string. Hero elements carry `data-fly="left"|"right"` attributes (consumed by Task 7's intro timeline). Grid lines carry class `.grid-line` (consumed by Tasks 7–8).

- [ ] **Step 1: Write the failing test**

`tests/pages.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { pages, getPage } from '../src/pages/index.js'

describe('page registry', () => {
  it('has the 7 pages in nav order', () => {
    expect(pages.map((p) => p.title)).toEqual([
      'Home', 'Bio', 'Research', 'Projects', 'CV', 'Hobbies', 'Contact',
    ])
  })

  it('every page has path, title, icon, and render()', () => {
    const iconIds = ['star', 'smiley', 'atom', 'cube', 'document', 'controller', 'plane']
    pages.forEach((p, i) => {
      expect(p.path).toMatch(/^\//)
      expect(p.icon).toBe(iconIds[i])
      expect(typeof p.render()).toBe('string')
      expect(p.render().length).toBeGreaterThan(0)
    })
  })

  it('getPage resolves known paths and returns null for unknown', () => {
    expect(getPage('/').title).toBe('Home')
    expect(getPage('/bio').title).toBe('Bio')
    expect(getPage('/nope')).toBeNull()
  })

  it('home hero has fly-in markers and motifs', () => {
    const html = getPage('/').render()
    expect(html).toContain('data-fly="left"')
    expect(html).toContain('data-fly="right"')
    expect(html).toContain('class="emph"')
    expect(html).toContain('class="star4"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages.test.js`
Expected: FAIL — cannot resolve `../src/pages/index.js`

- [ ] **Step 3: Create src/components/motifs.js**

```js
export function gridSVG() {
  return `
  <svg class="grid-lines" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <line class="grid-line" x1="-80" y1="700" x2="760" y2="-140" stroke="var(--line)"/>
    <line class="grid-line" x1="240" y1="1030" x2="1220" y2="-100" stroke="var(--line)"/>
    <line class="grid-line" x1="840" y1="1060" x2="1600" y2="200" stroke="var(--line)"/>
    <line class="grid-line" x1="570" y1="-130" x2="1580" y2="930" stroke="var(--line)"/>
    <line class="grid-line" x1="80" y1="-100" x2="950" y2="1030" stroke="var(--line)"/>
    <line class="grid-line grid-accent" x1="1110" y1="1060" x2="1690" y2="400" stroke="var(--accent)" stroke-width="2"/>
  </svg>`
}

export function emphasisSVG() {
  return `
  <svg class="emph" viewBox="0 0 64 58" fill="none" aria-hidden="true">
    <g stroke="var(--accent)" stroke-width="3">
      <line class="emph-line" x1="8" y1="50" x2="24" y2="34"/>
      <line class="emph-line" x1="22" y1="12" x2="29" y2="30"/>
      <line class="emph-line" x1="46" y1="6" x2="47" y2="26"/>
    </g>
  </svg>`
}

export function starSVG() {
  return `
  <svg class="star4" viewBox="0 0 46 46" aria-hidden="true">
    <path fill="var(--accent)" d="M23 0 L26 20 L46 23 L26 26 L23 46 L20 26 L0 23 L20 20 Z"/>
  </svg>`
}
```

- [ ] **Step 4: Create the 7 page modules**

`src/pages/home.js`:

```js
import { emphasisSVG, starSVG } from '../components/motifs.js'

export default {
  path: '/',
  title: 'Home',
  icon: 'star',
  render() {
    return `
    <section class="hero">
      <p class="kicker" data-fly="left">Hello! I'm <span class="kicker-arrow">&darr;</span></p>
      <div class="name-wrap">
        ${emphasisSVG()}
        <h1 class="name" data-fly="right">Your<br>Name</h1>
        ${starSVG()}
      </div>
      <p class="titles u-label" data-fly="left">PhD Student &mdash; Placeholder University / Dept. of Placeholder</p>
      <p class="splash" data-fly="right">A one-or-two sentence mission statement lives here &mdash; what you work on, why it matters, and a hint of who you are.</p>
      <p class="extra" data-fly="left">Currently &mdash; placeholder status</p>
    </section>`
  },
}
```

`src/pages/bio.js`:

```js
export default {
  path: '/bio',
  title: 'Bio',
  icon: 'smiley',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Bio</h2>
      <div class="bio-grid">
        <div class="portrait" aria-label="Portrait placeholder"></div>
        <div class="bio-text">
          <p>Placeholder bio paragraph one &mdash; where you're from, what you study, and the path that led you here. Two to four sentences of warm, human introduction.</p>
          <p>Placeholder bio paragraph two &mdash; current focus, advisor/lab, and something a little personal to keep it playful.</p>
        </div>
      </div>
    </section>`
  },
}
```

`src/pages/research.js`:

```js
export default {
  path: '/research',
  title: 'Research',
  icon: 'atom',
  render() {
    const pubs = [1, 2, 3]
      .map(
        (i) => `
        <li class="pub">
          <p class="pub-title">Placeholder Paper Title ${i}: Something Interesting About Something</p>
          <p class="pub-meta u-label">Author One, Your Name, Author Three &mdash; Placeholder Venue 202${i}</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Research</h2>
      <p class="content-intro">Placeholder research statement &mdash; the questions you chase and why they matter.</p>
      <ul class="pub-list">${pubs}</ul>
    </section>`
  },
}
```

`src/pages/projects.js`:

```js
export default {
  path: '/projects',
  title: 'Projects',
  icon: 'cube',
  render() {
    const cards = [1, 2, 3, 4]
      .map(
        (i) => `
        <li class="card">
          <div class="card-thumb" aria-hidden="true"></div>
          <p class="card-title">Placeholder Project ${i}</p>
          <p class="card-blurb">One-line description of what it does and why it's neat.</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Projects</h2>
      <ul class="card-grid">${cards}</ul>
    </section>`
  },
}
```

`src/pages/cv.js`:

```js
export default {
  path: '/cv',
  title: 'CV',
  icon: 'document',
  render() {
    const rows = [
      ['2024&ndash;now', 'PhD Student, Placeholder University'],
      ['2020&ndash;2024', 'B.S. Placeholder Major, Placeholder College'],
      ['2023', 'Placeholder Award or Fellowship'],
    ]
      .map(
        ([when, what]) => `
        <li class="cv-row">
          <span class="cv-when u-label">${when}</span>
          <span class="cv-what">${what}</span>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">CV</h2>
      <ul class="cv-list">${rows}</ul>
      <a class="extra" href="#" download>Download full CV (PDF)</a>
    </section>`
  },
}
```

`src/pages/hobbies.js`:

```js
export default {
  path: '/hobbies',
  title: 'Hobbies',
  icon: 'controller',
  render() {
    const cards = ['Hobby One', 'Hobby Two', 'Hobby Three', 'Hobby Four']
      .map(
        (h) => `
        <li class="card">
          <div class="card-thumb" aria-hidden="true"></div>
          <p class="card-title">${h}</p>
          <p class="card-blurb">A sentence about this hobby &mdash; placeholder.</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Hobbies</h2>
      <ul class="card-grid">${cards}</ul>
    </section>`
  },
}
```

`src/pages/contact.js`:

```js
export default {
  path: '/contact',
  title: 'Contact',
  icon: 'plane',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Contact</h2>
      <p class="content-intro">Placeholder sign-off &mdash; say hi!</p>
      <ul class="contact-list">
        <li><a class="extra" href="mailto:placeholder@example.edu">placeholder@example.edu</a></li>
        <li><a class="extra" href="#">GitHub</a></li>
        <li><a class="extra" href="#">Google Scholar</a></li>
        <li><a class="extra" href="#">LinkedIn</a></li>
      </ul>
    </section>`
  },
}
```

- [ ] **Step 5: Create src/pages/index.js**

```js
import home from './home.js'
import bio from './bio.js'
import research from './research.js'
import projects from './projects.js'
import cv from './cv.js'
import hobbies from './hobbies.js'
import contact from './contact.js'

export const pages = [home, bio, research, projects, cv, hobbies, contact]

export function getPage(path) {
  return pages.find((p) => p.path === path) ?? null
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/pages.test.js`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add motifs, page modules, and page registry"
```

---

### Task 3: History-API router (TDD)

**Files:**
- Create: `src/router.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Consumes: `getPage(path)` from `src/pages/index.js`.
- Produces: `createRouter(onChange) -> { start(), navigate(path), current }` from `src/router.js`. `onChange(from, to)` receives page objects; `from` is `null` on first `start()`. `start()` uses `history.replaceState` (redirecting unknown URLs to `/`); `navigate()` uses `pushState`; popstate re-resolves without pushing. Navigating to the current page is a no-op.

- [ ] **Step 1: Write the failing test**

`tests/router.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter } from '../src/router.js'

beforeEach(() => {
  history.replaceState({}, '', '/')
})

describe('router', () => {
  it('start() fires onChange(null, home) for /', () => {
    const onChange = vi.fn()
    createRouter(onChange).start()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null, expect.objectContaining({ path: '/' }))
  })

  it('start() on an unknown URL redirects to /', () => {
    history.replaceState({}, '', '/nope')
    const onChange = vi.fn()
    createRouter(onChange).start()
    expect(location.pathname).toBe('/')
    expect(onChange).toHaveBeenCalledWith(null, expect.objectContaining({ path: '/' }))
  })

  it('navigate() pushes the URL and fires onChange(from, to)', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    r.navigate('/bio')
    expect(location.pathname).toBe('/bio')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/bio' })
    )
  })

  it('navigate() to the current page is a no-op', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    onChange.mockClear()
    r.navigate('/')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('popstate re-resolves the location without pushing', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    onChange.mockClear()
    history.pushState({}, '', '/cv')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/cv' })
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/router.test.js`
Expected: FAIL — cannot resolve `../src/router.js`

- [ ] **Step 3: Implement src/router.js**

```js
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
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npm test`
Expected: PASS — pages.test.js (4) and router.test.js (5)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add history-API router with unknown-route redirect"
```

---

### Task 4: Nav component and static SPA wiring

**Files:**
- Create: `src/components/nav.js`
- Modify: `src/main.js` (replace stub entirely)

**Interfaces:**
- Consumes: `pages`/`getPage` (Task 2), `createRouter` (Task 3).
- Produces: `createNav(el, onNavigate) -> { setActive(path) }` from `src/components/nav.js`. `main.js` sets `document.body.dataset.page` to `'home'` for `/` or the path without slash (e.g. `'bio'`) — CSS in Task 5 keys off this.

- [ ] **Step 1: Implement src/components/nav.js**

```js
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
```

- [ ] **Step 2: Replace src/main.js with router wiring (no animation yet)**

```js
import { createRouter } from './router.js'
import { createNav } from './components/nav.js'

const pageEl = document.getElementById('page')
const nav = createNav(document.getElementById('nav'), (path) => router.navigate(path))

const router = createRouter((from, to) => {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  pageEl.innerHTML = to.render()
  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`
})

router.start()
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev` — open http://localhost:5173 and check:
- Hero placeholder text renders on load (unstyled is fine).
- Clicking each nav link swaps content, updates the URL (no reload — watch the Network tab), highlights the active link, and updates the tab title.
- Browser back/forward walk the history correctly.
- Visiting http://localhost:5173/research directly renders Research; http://localhost:5173/nope lands on Home with URL `/`.

- [ ] **Step 4: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: wire nav and router for static page rendering"
```

---

### Task 5: Visual system — layout, hero, sidebar, page styles

**Files:**
- Create: `src/components/sidebar.js`
- Modify: `styles/layout.css`, `styles/pages.css` (replace placeholder comments entirely), `src/main.js`

**Interfaces:**
- Consumes: mounts from Task 1, `gridSVG()` from Task 2, `body[data-page]` from Task 4.
- Produces: `renderSidebar(el)` from `src/components/sidebar.js` (renders face/name/affiliation/splash into the sidebar mount). Layout rules later tasks animate against: `.sidebar` hidden on home via CSS, `#grid-mount` hidden off-home via CSS, `.section-icon` fixed right. **Do not restructure these selectors in later tasks.**

- [ ] **Step 1: Implement src/components/sidebar.js**

```js
export function renderSidebar(el) {
  el.innerHTML = `
    <div class="sidebar-face" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="50" cy="50" r="46"/>
        <circle cx="38" cy="42" r="2.5" fill="currentColor"/>
        <circle cx="62" cy="42" r="2.5" fill="currentColor"/>
        <path d="M36 60 Q50 72 64 60"/>
      </svg>
    </div>
    <p class="sidebar-name">Your<br>Name</p>
    <p class="sidebar-affil u-label">PhD Student &mdash; Placeholder University</p>
    <p class="sidebar-splash">A one-or-two sentence mission statement lives here.</p>`
}
```

- [ ] **Step 2: Replace styles/layout.css**

```css
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 44px;
  z-index: 10;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(6px);
}
.nav-logo { font-weight: 700; }
.nav-links { display: flex; gap: 26px; }
.nav-links a.active { color: var(--accent); }

.layout {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding-top: var(--nav-h);
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
}
body[data-page='home'] .layout { grid-template-columns: 1fr; }
body[data-page='home'] .sidebar { display: none; }

.sidebar {
  position: sticky;
  top: var(--nav-h);
  height: calc(100vh - var(--nav-h));
  padding: var(--space-5) var(--space-3) var(--space-3) 44px;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.sidebar-face { width: 72px; color: var(--accent); }
.sidebar-face svg { display: block; width: 100%; }
.sidebar-name {
  font-size: 22px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-top: var(--space-2);
}
.sidebar-affil { color: var(--accent); }
.sidebar-splash { font-size: 13px; line-height: 1.5; color: var(--ink-2); }

.page {
  padding: var(--space-5) 84px;
  max-width: 820px;
}

#grid-mount {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
#grid-mount .grid-lines { width: 100%; height: 100%; display: block; }
body:not([data-page='home']) #grid-mount { display: none; }

.section-icon {
  position: fixed;
  right: 7vw;
  top: 50%;
  width: min(300px, 26vw);
  transform: translateY(-50%);
  z-index: 1;
  color: var(--accent-soft);
  pointer-events: none;
}
.section-icon svg { display: block; width: 100%; height: auto; }
```

- [ ] **Step 3: Replace styles/pages.css**

```css
/* ---- hero (Home) ---- */
.hero {
  min-height: calc(100vh - var(--nav-h) - 2 * var(--space-5));
  max-width: 680px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.kicker {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--ink-2);
  margin-bottom: 44px;
}
.kicker-arrow { color: var(--accent); }
.name-wrap { position: relative; align-self: flex-start; }
.name {
  font-size: clamp(44px, 7vw, 68px);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.035em;
  line-height: 1.02;
}
.emph { position: absolute; top: -34px; left: -40px; width: 64px; }
.star4 { position: absolute; right: -58px; bottom: -20px; width: 46px; }
.titles { color: var(--accent); margin-top: 34px; }
.splash {
  font-size: 16.5px;
  line-height: 1.55;
  max-width: 46ch;
  color: var(--ink-2);
  margin-top: var(--space-2);
}
.extra {
  display: inline-block;
  align-self: flex-start;
  border: 1px solid var(--ink);
  padding: 7px 14px;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: var(--space-3);
}

/* ---- content pages ---- */
.page-title {
  font-size: 34px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}
.content-intro {
  font-size: 16.5px;
  line-height: 1.55;
  max-width: 46ch;
  color: var(--ink-2);
  margin-bottom: var(--space-4);
}
.bio-grid { display: flex; gap: var(--space-4); align-items: flex-start; }
.portrait {
  flex: 0 0 220px;
  aspect-ratio: 4 / 5;
  background: var(--accent-soft);
  border: 1px solid var(--line);
}
.bio-text { display: flex; flex-direction: column; gap: var(--space-2); }
.bio-text p { line-height: 1.6; color: var(--ink-2); }

.pub-list { display: flex; flex-direction: column; gap: var(--space-3); }
.pub { border-left: 2px solid var(--accent); padding-left: var(--space-2); }
.pub-title { font-weight: 700; line-height: 1.4; }
.pub-meta { color: var(--ink-2); margin-top: var(--space-1); }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}
.card { border: 1px solid var(--line); padding: var(--space-2); }
.card-thumb { aspect-ratio: 16 / 10; background: var(--accent-soft); margin-bottom: var(--space-2); }
.card-title { font-weight: 700; }
.card-blurb { font-size: 13px; line-height: 1.5; color: var(--ink-2); margin-top: var(--space-1); }

.cv-list { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
.cv-row { display: flex; gap: var(--space-3); align-items: baseline; }
.cv-when { color: var(--accent); flex: 0 0 110px; }
.contact-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
```

- [ ] **Step 4: Mount grid and sidebar in src/main.js**

Replace `src/main.js`:

```js
import { createRouter } from './router.js'
import { createNav } from './components/nav.js'
import { renderSidebar } from './components/sidebar.js'
import { gridSVG } from './components/motifs.js'

document.getElementById('grid-mount').innerHTML = gridSVG()
renderSidebar(document.getElementById('sidebar'))

const pageEl = document.getElementById('page')
const nav = createNav(document.getElementById('nav'), (path) => router.navigate(path))

const router = createRouter((from, to) => {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  pageEl.innerHTML = to.render()
  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`
})

router.start()
```

- [ ] **Step 5: Manual verification against the mockup**

Run: `npm run dev` and compare Home to mockup direction 2 (https://claude.ai/code/artifact/9a204df7-8744-4980-b0ec-4532f03e2c80):
- Home: kicker with cobalt ↓, 44px gap, big uppercase name with cobalt emphasis lines top-left and star bottom-right, cobalt uppercase titles, splash, boxed "currently" element, hairline diamond grid behind (one cobalt line), no sidebar.
- Every other page: sidebar on the left (smiley face, name, affiliation, splash), content in the right column, no grid lines.
- No horizontal scrollbar on any page.

- [ ] **Step 6: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: full static visual system - layout, hero, sidebar, page styles"
```

---

### Task 6: Section icon component

**Files:**
- Create: `src/components/sectionIcon.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `#icon` mount (Task 1), page `icon` ids (Task 2).
- Produces: `createSectionIcon(el) -> { set(id), current, el }` from `src/components/sectionIcon.js`. `set(id)` swaps the SVG instantly; `el` is exposed so Task 8 can tween the flip. Icon ids: `star, smiley, atom, cube, document, controller, plane`.

- [ ] **Step 1: Implement src/components/sectionIcon.js**

```js
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
```

- [ ] **Step 2: Wire into src/main.js**

Add the import and creation, and call `icon.set` in the route handler. Replace `src/main.js`:

```js
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
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. Each page shows its pale-cobalt line icon on the right (star / smiley / atom / cube / document / controller / plane), behind/beside content without blocking clicks. Icon swaps instantly on nav (flip comes in Task 8).

- [ ] **Step 4: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: add section icon component with per-page line icons"
```

---

### Task 7: Motion constants and hero intro animation

**Files:**
- Create: `src/animations/motion.js`, `src/animations/heroIntro.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: hero `data-fly` markers, `.grid-line`, `.emph-line`, `.star4` (Task 2), `.section-icon` (Task 6).
- Produces: `DUR`, `EASE`, `prefersReducedMotion()` from `src/animations/motion.js`; `heroIntro() -> gsap.timeline` from `src/animations/heroIntro.js` (Task 8 replays it, sped up, when returning Home). `heroIntro` assumes the hero DOM is already rendered and grid-line transforms are clean.

- [ ] **Step 1: Create src/animations/motion.js**

```js
export const DUR = { fly: 0.7, grid: 0.9, pop: 0.5, page: 0.45, flip: 0.6 }

export const EASE = {
  fly: 'power3.out',
  out: 'power2.in',
  page: 'power2.out',
  pop: 'back.out(2.4)',
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

- [ ] **Step 2: Create src/animations/heroIntro.js**

```js
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

  tl.from('.star4', {
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
```

- [ ] **Step 3: Play the intro on first Home load in src/main.js**

Replace the route handler and start block at the bottom of `src/main.js` (imports at top gain three lines):

```js
import { heroIntro } from './animations/heroIntro.js'
import { prefersReducedMotion } from './animations/motion.js'

// ... existing mounts/nav/icon setup unchanged ...

const router = createRouter((from, to) => {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  pageEl.innerHTML = to.render()
  icon.set(to.icon)
  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`

  if (!from && to.path === '/' && !prefersReducedMotion()) heroIntro()
})

router.start()
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`:
- Reload `/`: grid lines fly in along their diagonals; kicker/name/titles/splash/currently fly in from alternating sides with stagger; emphasis lines pop with overshoot, star pops with a spin; icon fades/scales in. Sequence feels smooth, roughly 1.5–2s total.
- Reload `/bio` directly: NO intro plays; page renders instantly.
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → reload `/`: no animation, everything just there.

- [ ] **Step 5: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: hero intro timeline - fly-ins, grid draw, motif pop-ins"
```

---

### Task 8: Page transitions — collapse, expand, slide, icon flip

**Files:**
- Create: `src/animations/pageTransition.js`
- Modify: `src/main.js` (replace entirely — final version below)

**Interfaces:**
- Consumes: everything above — `DUR/EASE/prefersReducedMotion`, `heroIntro`, `createSectionIcon`'s `{ set, el }`, page objects, mounts.
- Produces: `transition({ from, to, els, icon }) -> gsap.timeline` from `src/animations/pageTransition.js`. `els = { page, sidebar, grid }` (the three mount elements). The timeline is interrupt-safe: `main.js` force-completes any running timeline (`progress(1).kill()`) before starting a new one.

- [ ] **Step 1: Implement src/animations/pageTransition.js**

```js
import { gsap } from 'gsap'
import { DUR, EASE } from './motion.js'
import { heroIntro } from './heroIntro.js'

function setPage(to, els, icon) {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  els.page.innerHTML = to.render()
  icon.set(to.icon)
  gsap.set('.grid-line', { clearProps: 'all' })
  gsap.set(els.sidebar, { clearProps: 'all' })
}

export function transition({ from, to, els, icon }) {
  const tl = gsap.timeline()
  const vw = window.innerWidth
  const fromHome = from.path === '/'
  const toHome = to.path === '/'

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
    tl.to(els.page.children, {
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

  /* -- icon flip out -- */
  tl.to(icon.el, { rotationY: 90, duration: DUR.flip / 2, ease: 'power2.in' }, 0)

  /* -- swap DOM at the midpoint -- */
  tl.add(() => setPage(to, els, icon))

  /* -- icon flip in -- */
  tl.to(icon.el, { rotationY: 0, duration: DUR.flip / 2, ease: 'power2.out' })

  /* -- incoming -- */
  if (toHome) {
    tl.add(heroIntro().timeScale(1.4), '<')
  } else {
    if (fromHome) {
      tl.from(els.sidebar, {
        x: -(els.sidebar.offsetWidth || 340) - 40,
        opacity: 0,
        duration: DUR.page,
        ease: EASE.page,
      }, '<')
    }
    tl.from(els.page.children, {
      x: vw * 0.25,
      opacity: 0,
      duration: DUR.page,
      ease: EASE.page,
    }, '<0.05')
  }

  return tl
}
```

- [ ] **Step 2: Replace src/main.js with the final orchestrator**

```js
import { createRouter } from './router.js'
import { createNav } from './components/nav.js'
import { renderSidebar } from './components/sidebar.js'
import { createSectionIcon } from './components/sectionIcon.js'
import { gridSVG } from './components/motifs.js'
import { heroIntro } from './animations/heroIntro.js'
import { transition } from './animations/pageTransition.js'
import { prefersReducedMotion } from './animations/motion.js'

document.getElementById('grid-mount').innerHTML = gridSVG()
renderSidebar(document.getElementById('sidebar'))

const els = {
  page: document.getElementById('page'),
  sidebar: document.getElementById('sidebar'),
  grid: document.getElementById('grid-mount'),
}
const icon = createSectionIcon(document.getElementById('icon'))
const nav = createNav(document.getElementById('nav'), (path) => router.navigate(path))

let activeTl = null

function renderInstant(to) {
  document.body.dataset.page = to.path === '/' ? 'home' : to.path.slice(1)
  els.page.innerHTML = to.render()
  icon.set(to.icon)
}

const router = createRouter((from, to) => {
  if (activeTl) {
    activeTl.progress(1).kill()
    activeTl = null
  }

  nav.setActive(to.path)
  document.title = to.path === '/' ? 'Your Name' : `${to.title} — Your Name`

  if (!from || prefersReducedMotion()) {
    renderInstant(to)
    if (!from && to.path === '/' && !prefersReducedMotion()) activeTl = heroIntro()
    return
  }

  activeTl = transition({ from, to, els, icon })
})

router.start()
```

- [ ] **Step 3: Manual verification — the full choreography**

Run: `npm run dev`:
- **Home → Bio:** grid lines fly away; hero content shrinks/flies toward the top-left (reads as collapsing into the sidebar); sidebar slides in from the left; icon flips star→smiley; bio content slides in from the right.
- **Bio → Home:** sidebar slides out left; icon flips back; hero replays its intro (faster); grid lines return.
- **Bio → Research:** sidebar does NOT move; content slides out left, icon flips smiley→atom, new content slides in from right; quick (~0.5s).
- **Rapid clicking:** hammer 4 nav links quickly — no broken states; every element lands in its final position (interrupted timelines jump to completion).
- **Back/forward buttons:** play the same transitions.
- **Reduced motion emulation:** all transitions become instant renders.
- DevTools Performance: record Home→Bio; confirm no layout thrash (animation is transform/opacity only).

- [ ] **Step 4: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: animated page transitions - hero collapse, sidebar, icon flip"
```

---

### Task 9: Responsive layout, polish, deploy config

**Files:**
- Create: `vercel.json`
- Modify: `styles/layout.css` (append media query)

**Interfaces:**
- Consumes: layout classes from Task 5.
- Produces: deploy-ready static SPA.

- [ ] **Step 1: Append the mobile breakpoint to styles/layout.css**

```css
@media (max-width: 760px) {
  .nav { padding: 0 16px; }
  .nav-links { gap: 12px; }
  .layout { grid-template-columns: 1fr; }
  .sidebar {
    height: auto;
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
    padding: 10px 20px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    z-index: 5;
  }
  .sidebar-face { width: 40px; }
  .sidebar-name { font-size: 14px; margin-top: 0; }
  .sidebar-name br { display: none; }
  .sidebar-affil, .sidebar-splash { display: none; }
  .page { padding: var(--space-4) 24px; }
  .section-icon { display: none; }
  .bio-grid { flex-direction: column; }
  .cv-row { flex-direction: column; gap: 2px; }
}
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: Production build check**

Run: `npm run build && npm run preview` — open the preview URL.
Expected: build succeeds; site behaves identically to dev (spot-check Home intro + one transition).

- [ ] **Step 4: Manual responsive verification**

In DevTools device toolbar at 375px width:
- Non-home pages: sidebar is a compact sticky strip (face + name) under the nav; content full-width below; no big icon; no horizontal scroll.
- Home: hero fits, name wraps cleanly, motifs don't overflow the viewport.
- Resize across 760px on a non-home page: layout swaps columns↔strip without replaying any transition.

- [ ] **Step 5: Full walkthrough (spec's testing section)**

Walk every pair: Home↔each page, two page↔page hops, back/forward, deep link to `/projects`, `/nope` redirect, rapid clicks, reduced-motion pass. All good = done.

- [ ] **Step 6: Run tests, then commit**

Run: `npm test` — expected: all PASS.

```bash
git add -A
git commit -m "feat: responsive mobile layout and Vercel SPA rewrite config"
```
