import { esc } from '../util.js'
import site from '../../content/site.yaml'

export function renderSidebar(el) {
  const face = site.face
    ? `<img src="/${esc(site.face)}" alt="">`
    : `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="50" cy="50" r="46"/>
        <circle cx="38" cy="42" r="2.5" fill="currentColor"/>
        <circle cx="62" cy="42" r="2.5" fill="currentColor"/>
        <path d="M36 60 Q50 72 64 60"/>
      </svg>`
  const socials = (site.socials ?? [])
    .filter(s => s.url)
    .map(s => {
      const isDownload = /\.pdf($|\?)/i.test(s.url) || /\/files\//.test(s.url)
      const rel = s.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''
      const dl = isDownload ? ' download' : ''
      return `<a class="sidebar-social" href="/${esc(s.url.replace(/^\//, ''))}"${rel}${dl}>${esc(s.label)}</a>`
    })
    .join('')
  el.innerHTML = `
    <div class="sidebar-face" aria-hidden="true">${face}</div>
    <p class="sidebar-name">${site.name_lines.map(esc).join(' <br>')}</p>
    <p class="sidebar-affil u-label">${esc(site.affiliation_short)}</p>
    <nav class="sidebar-socials" aria-label="Social links">${socials}</nav>`
}
