import { esc } from '../util.js'
import content from '../../content/contact.yaml'

export default {
  path: '/contact',
  title: 'Contact',
  icon: 'plane',
  render() {
    const links = content.links
      .map((l) => {
        const href = l.url ? esc(l.url) : '#'
        const external = l.url && !l.url.startsWith('mailto:')
        return `<li><a class="extra" href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a></li>`
      })
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Contact</h2>
      <p class="content-intro">${esc(content.intro)}</p>
      <ul class="contact-list">${links}</ul>
    </section>`
  },
}
