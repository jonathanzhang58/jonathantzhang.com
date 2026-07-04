import { esc } from '../util.js'
import content from '../../content/projects.yaml'

export function cardHTML(item) {
  const thumb = item.image
    ? `<img class="card-thumb" src="/${esc(item.image)}" alt="">`
    : `<div class="card-thumb" aria-hidden="true"></div>`
  const title = item.link
    ? `<a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a>`
    : esc(item.title)
  return `
    <li class="card">
      ${thumb}
      <p class="card-title">${title}</p>
      <p class="card-blurb">${esc(item.blurb)}</p>
    </li>`
}

export default {
  path: '/projects',
  title: 'Projects',
  icon: 'cube',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Projects</h2>
      <ul class="card-grid">${content.projects.map(cardHTML).join('')}</ul>
    </section>`
  },
}
