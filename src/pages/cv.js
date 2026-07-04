import { esc } from '../util.js'
import content from '../../content/cv.yaml'

export default {
  path: '/cv',
  title: 'CV',
  icon: 'document',
  render() {
    const rows = content.entries
      .map(
        (e) => `
        <li class="cv-row">
          <span class="cv-when u-label">${esc(e.when)}</span>
          <span class="cv-what">${esc(e.what)}</span>
        </li>`
      )
      .join('')
    const href = content.pdf ? `/${esc(content.pdf)}` : '#'
    return `
    <section class="content">
      <h2 class="page-title">CV</h2>
      <ul class="cv-list">${rows}</ul>
      <a class="extra" href="${href}" download>Download full CV (PDF)</a>
    </section>`
  },
}
