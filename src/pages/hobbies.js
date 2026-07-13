import { esc, slugify } from '../util.js'
import content from '../../content/hobbies.yaml'

// Hobby cards are image + title, plus an optional blurb — no "Read more".
// Every hobby gets a detail page, and the whole tile links to it.
function hobbyCardHTML(item) {
  const fit = item.image_fit === 'contain' ? ' card-thumb-contain' : ''
  const thumb = item.image
    ? `<img class="card-thumb${fit}" src="/${esc(item.image)}" alt="" loading="lazy" decoding="async">`
    : `<div class="card-thumb" aria-hidden="true"></div>`
  const text = item.blurb ?? item.text
  const blurb = text ? `<p class="card-blurb">${esc(text)}</p>` : ''
  const href = `/hobbies/${item.slug || slugify(item.title)}`
  return `
    <li class="card card-clickable card-hobby">
      <a class="card-link" href="${href}" data-nav>
        ${thumb}
        <p class="card-title">${esc(item.title)}</p>
        ${blurb}
      </a>
    </li>`
}

export default {
  path: '/hobbies',
  title: 'Hobbies',
  icon: 'controller',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Hobbies</h2>
      <ul class="card-grid">${content.hobbies.map(hobbyCardHTML).join('')}</ul>
    </section>`
  },
}
