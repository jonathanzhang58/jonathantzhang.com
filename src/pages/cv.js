export default {
  path: '/cv',
  title: 'CV',
  icon: 'document',
  render() {
    const rows = [
      ['2024&ndash;now', 'PhD Student, Placeholder University'],
      ['2020&ndash;2024', 'B.S. Placeholder Major, Placeholder College'],
      ['2023', 'Placeholder Award or Fellowship'],
    ]
      .map(
        ([when, what]) => `
        <li class="cv-row">
          <span class="cv-when u-label">${when}</span>
          <span class="cv-what">${what}</span>
        </li>`
      )
      .join('')
    return `
    <section class="content">
      <h2 class="page-title">CV</h2>
      <ul class="cv-list">${rows}</ul>
      <a class="extra" href="#" download>Download full CV (PDF)</a>
    </section>`
  },
}
