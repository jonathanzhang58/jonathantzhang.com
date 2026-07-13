import { esc, slugify } from '../util.js'
import content from '../../content/projects.yaml'

// A card with a `link:` is fully clickable to that external link — hovering
// anywhere highlights the border and title. A `page:` block adds a
// "Read more" line, and only that line routes to the detail page.
export function cardHTML(item, basePath) {
  const fit = item.image_fit === 'contain' ? ' card-thumb-contain' : ''
  const thumb = item.image
    ? `<img class="card-thumb${fit}" src="/${esc(item.image)}" alt="">`
    : `<div class="card-thumb" aria-hidden="true"></div>`
  const more = item.page
    ? `<a class="card-more" href="${basePath}/${item.slug || slugify(item.title)}" data-nav>Read more &rarr;</a>`
    : ''
  if (item.link) {
    return `
    <li class="card card-clickable">
      <a class="card-link" href="${esc(item.link)}" target="_blank" rel="noopener">
        ${thumb}
        <p class="card-title card-title-linked">${esc(item.title)}</p>
        <p class="card-blurb">${esc(item.blurb)}</p>
      </a>
      ${more}
    </li>`
  }
  return `
    <li class="card">
      ${thumb}
      <p class="card-title">${esc(item.title)}</p>
      <p class="card-blurb">${esc(item.blurb)}</p>
      ${more}
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
