export default {
  path: '/projects',
  title: 'Projects',
  icon: 'cube',
  render() {
    const cards = [1, 2, 3, 4]
      .map(
        (i) => `
        <li class="card">
          <div class="card-thumb" aria-hidden="true"></div>
          <p class="card-title">Placeholder Project ${i}</p>
          <p class="card-blurb">One-line description of what it does and why it's neat.</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Projects</h2>
      <ul class="card-grid">${cards}</ul>
    </section>`
  },
}
