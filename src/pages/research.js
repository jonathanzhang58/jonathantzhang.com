export default {
  path: '/research',
  title: 'Research',
  icon: 'atom',
  render() {
    const pubs = [1, 2, 3]
      .map(
        (i) => `
        <li class="pub">
          <p class="pub-title">Placeholder Paper Title ${i}: Something Interesting About Something</p>
          <p class="pub-meta u-label">Author One, Your Name, Author Three &mdash; Placeholder Venue 202${i}</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Research</h2>
      <p class="content-intro">Placeholder research statement &mdash; the questions you chase and why they matter.</p>
      <ul class="pub-list">${pubs}</ul>
    </section>`
  },
}
