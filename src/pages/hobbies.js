export default {
  path: '/hobbies',
  title: 'Hobbies',
  icon: 'controller',
  render() {
    const cards = ['Hobby One', 'Hobby Two', 'Hobby Three', 'Hobby Four']
      .map(
        (h) => `
        <li class="card">
          <div class="card-thumb" aria-hidden="true"></div>
          <p class="card-title">${h}</p>
          <p class="card-blurb">A sentence about this hobby &mdash; placeholder.</p>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">Hobbies</h2>
      <ul class="card-grid">${cards}</ul>
    </section>`
  },
}
