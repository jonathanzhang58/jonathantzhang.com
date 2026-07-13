import { esc, slugify } from '../util.js'
import projectsPage from './projects.js'
import hobbiesPage from './hobbies.js'
import projectContent from '../../content/projects.yaml'
import hobbyContent from '../../content/hobbies.yaml'

// A card item grows a detail page by adding a `page:` list in the yaml.
// Each list entry is one block: a plain string is a paragraph, `heading:`
// is a section heading, `image:` (+ optional `caption:`) is a figure.
function blockHTML(block) {
  if (typeof block === 'string') return `<p class="detail-p">${esc(block)}</p>`
  if (block?.heading) return `<h3 class="detail-h">${esc(block.heading)}</h3>`
  if (block?.image) {
    const cap = block.caption ? `<figcaption class="detail-cap">${esc(block.caption)}</figcaption>` : ''
    return `
      <figure class="detail-fig">
        <img class="detail-img" src="/${esc(block.image)}" alt="${esc(block.caption ?? block.image)}">
        ${cap}
      </figure>`
  }
  return ''
}

function makeDetailPage(item, parent) {
  return {
    path: `${parent.path}/${item.slug || slugify(item.title)}`,
    title: item.title,
    icon: parent.icon,
    parent: parent.path,
    render() {
      const ext = item.link
        ? `<a class="detail-ext" href="${esc(item.link)}" target="_blank" rel="noopener">Visit &nearr;</a>`
        : ''
      return `
      <section class="content detail">
        <a class="detail-back" href="${parent.path}" data-nav>&larr; ${esc(parent.title)}</a>
        <h2 class="page-title">${esc(item.title)}</h2>
        <div class="detail-body">${(item.page ?? []).map(blockHTML).join('')}</div>
        ${ext}
      </section>`
    },
  }
}

// Every hobby gets a detail page (empty until it grows a `page:` list);
// projects only get one once `page:` is added.
export const detailPages = [
  ...(projectContent.projects ?? []).filter((p) => p.page).map((p) => makeDetailPage(p, projectsPage)),
  ...(hobbyContent.hobbies ?? []).map((h) => makeDetailPage(h, hobbiesPage)),
]
