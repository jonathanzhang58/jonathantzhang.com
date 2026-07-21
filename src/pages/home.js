import { emphasisSVG, starSVG } from '../components/motifs.js'
import { esc, mdBold } from '../util.js'
import site from '../../content/site.yaml'
import content from '../../content/home.yaml'

export default {
  path: '/',
  title: 'Home',
  icon: 'star',
  render() {
    return `
    <section class="hero">
      <p class="kicker" data-fly="left">${esc(content.kicker)} <span class="kicker-arrow">&darr;</span></p>
      <div class="name-wrap">
        ${emphasisSVG()}
        <h1 class="name" data-fly="right">${site.name_lines.map(esc).join('<br>')}</h1>
        ${starSVG()}
      </div>
      <p class="titles u-label" data-fly="left">${esc(site.affiliation)}</p>
      ${site.splash.split('\n').filter(Boolean).map(p => `<p class="splash" data-fly="right">${mdBold(p)}</p>`).join('')}
      <p class="extra" data-fly="left">${esc(content.currently)}</p>
      <p class="updated u-label" data-fly="right">Last updated ${new Date(__LAST_UPDATED__).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </section>`
  },
}
