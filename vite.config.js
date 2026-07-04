import { defineConfig } from 'vite'
import { load } from 'js-yaml'

// Parses content/*.yaml at build time into plain JS objects, so pages can
// `import content from '../../content/foo.yaml'` with zero runtime cost.
const yamlPlugin = {
  name: 'yaml-content',
  transform(src, id) {
    if (id.endsWith('.yaml') || id.endsWith('.yml')) {
      return { code: `export default ${JSON.stringify(load(src))}`, map: null }
    }
  },
}

export default defineConfig({
  plugins: [yamlPlugin],
  test: {
    environment: 'happy-dom',
  },
})
