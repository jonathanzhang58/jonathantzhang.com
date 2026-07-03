import { emphasisSVG, starSVG } from '../components/motifs.js'

export default {
  path: '/',
  title: 'Home',
  icon: 'star',
  render() {
    return `
    <section class="hero">
      <p class="kicker" data-fly="left">Hello! I'm <span class="kicker-arrow">&darr;</span></p>
      <div class="name-wrap">
        ${emphasisSVG()}
        <h1 class="name" data-fly="right">Your<br>Name</h1>
        ${starSVG()}
      </div>
      <p class="titles u-label" data-fly="left">PhD Student &mdash; Placeholder University / Dept. of Placeholder</p>
      <p class="splash" data-fly="right">A one-or-two sentence mission statement lives here &mdash; what you work on, why it matters, and a hint of who you are.</p>
      <p class="extra" data-fly="left">Currently &mdash; placeholder status</p>
    </section>`
  },
}
