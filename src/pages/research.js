import { esc } from '../util.js'
import content from '../../content/research.yaml'

export default {
  path: '/research',
  title: 'Research',
  icon: 'atom',
  render() {
    const pubs = content.publications
      .map((p) => {
        const title = p.link
          ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
          : esc(p.title)
        return `
        <li class="pub">
          <p class="pub-title">${title}</p>
          <p class="pub-meta u-label">${esc(p.authors)} — ${esc(p.venue)}</p>
        </li>`
      })
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Research</h2>
      <p class="content-intro">${esc(content.intro)}</p>
      <ul class="pub-list">${pubs}</ul>
    </section>`
  },
}
