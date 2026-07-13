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
          <p class="pub-meta u-label">${esc(p.authors)}</p>
          <p class="pub-meta u-label">Venue: ${esc(p.venue)}</p>
          ${p.note ? `<p class="pub-meta u-label">${esc(p.note)}</p>` : ''}
        </li>`
      })
      .join('')
    const projectGroup = (key, label, items) =>
      items?.length
        ? `<p class="lab-proj-label u-label lab-proj-label--${key}">${label}</p>
          <ul class="lab-proj-list">
            ${items
              .map((p) => {
                const title = p.link
                  ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
                  : esc(p.title)
                return `
            <li>
              <p class="proj-title">${title}</p>
              <p class="lab-text">${esc(p.description)}</p>
            </li>`
              })
              .join('\n')}
          </ul>`
        : ''
    const labs = (content.labs ?? [])
      .map((lab) => {
        const name = lab.link
          ? `<a href="${esc(lab.link)}" target="_blank" rel="noopener">${esc(lab.name)}</a>`
          : esc(lab.name)
        return `
        <div class="lab">
          <p class="lab-focus u-label">${esc(lab.focus)}</p>
          <h3 class="lab-name">${name}</h3>
          ${projectGroup('current', 'Current projects', lab.projects?.current)}
          ${projectGroup('completed', 'Completed projects', lab.projects?.completed)}
        </div>`
      })
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Research</h2>
      <p class="content-intro content-intro--wide">${esc(content.intro)}</p>
      <h3 class="section-heading">${esc(content.publications_heading ?? 'Publications')}</h3>
      <ul class="pub-list">${pubs}</ul>
      <div class="lab-grid">${labs}</div>
    </section>`
  },
}
