import { esc, mdLinks } from '../util.js'
import content from '../../content/bio.yaml'

export default {
  path: '/bio',
  title: 'Bio',
  icon: 'smiley',
  render() {
    const portrait = content.portrait
      ? `<img class="portrait" src="/${esc(content.portrait)}" alt="Portrait">`
      : `<div class="portrait" aria-label="Portrait placeholder"></div>`
    return `
    <section class="content">
      <h2 class="page-title">Bio</h2>
      <div class="bio-grid">
        ${portrait}
        <div class="bio-text">
          ${content.paragraphs.map((p) => `<p>${mdLinks(p)}</p>`).join('\n')}
        </div>
      </div>
    </section>`
  },
}
