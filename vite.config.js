import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import { load } from 'js-yaml'

// Last-content-change stamp for the hero. Prefers the last commit date; falls
// back to build time (equals deploy time on Vercel) when git isn't available.
function lastUpdated() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI']).toString().trim()
  } catch {
    return new Date().toISOString()
  }
}

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
  define: {
    __LAST_UPDATED__: JSON.stringify(lastUpdated()),
  },
  test: {
    environment: 'happy-dom',
  },
})
