import content from '../../content/hobbies.yaml'
import { cardHTML } from './projects.js'

export default {
  path: '/hobbies',
  title: 'Hobbies',
  icon: 'controller',
  render() {
    return `
    <section class="content">
      <h2 class="page-title">Hobbies</h2>
      <ul class="card-grid">${content.hobbies.map(cardHTML).join('')}</ul>
    </section>`
  },
}
