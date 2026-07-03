export default {
  path: '/bio',
  title: 'Bio',
  icon: 'smiley',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Bio</h2>
      <div class="bio-grid">
        <div class="portrait" aria-label="Portrait placeholder"></div>
        <div class="bio-text">
          <p>Placeholder bio paragraph one &mdash; where you're from, what you study, and the path that led you here. Two to four sentences of warm, human introduction.</p>
          <p>Placeholder bio paragraph two &mdash; current focus, advisor/lab, and something a little personal to keep it playful.</p>
        </div>
      </div>
    </section>`
  },
}
