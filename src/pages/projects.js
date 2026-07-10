import { esc, slugify } from '../util.js'
import content from '../../content/projects.yaml'

// An item with a `page:` block becomes a fully clickable card that routes to
// its detail page; otherwise only an external `link:` (if any) is clickable.
export function cardHTML(item, basePath) {
  const thumb = item.image
    ? `<img class="card-thumb" src="/${esc(item.image)}" alt="">`
    : `<div class="card-thumb" aria-hidden="true"></div>`
  if (item.page) {
    const href = `${basePath}/${item.slug || slugify(item.title)}`
    return `
    <li class="card card-clickable">
      <a class="card-link" href="${href}" data-nav>
        ${thumb}
        <p class="card-title">${esc(item.title)}</p>
        <p class="card-blurb">${esc(item.blurb)}</p>
        <p class="card-more">Read more &rarr;</p>
      </a>
    </li>`
  }
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
      <ul class="card-grid">${content.projects.map((p) => cardHTML(p, '/projects')).join('')}</ul>
    </section>`
  },
}
