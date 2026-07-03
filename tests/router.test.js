import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter } from '../src/router.js'

beforeEach(() => {
  history.replaceState({}, '', '/')
})

describe('router', () => {
  it('start() fires onChange(null, home) for /', () => {
    const onChange = vi.fn()
    createRouter(onChange).start()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null, expect.objectContaining({ path: '/' }))
  })

  it('start() on an unknown URL redirects to /', () => {
    history.replaceState({}, '', '/nope')
    const onChange = vi.fn()
    createRouter(onChange).start()
    expect(location.pathname).toBe('/')
    expect(onChange).toHaveBeenCalledWith(null, expect.objectContaining({ path: '/' }))
  })

  it('navigate() pushes the URL and fires onChange(from, to)', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    r.navigate('/bio')
    expect(location.pathname).toBe('/bio')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/bio' })
    )
  })

  it('navigate() to the current page is a no-op', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    onChange.mockClear()
    r.navigate('/')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('popstate re-resolves the location without pushing', () => {
    const onChange = vi.fn()
    const r = createRouter(onChange)
    r.start()
    onChange.mockClear()
    history.pushState({}, '', '/cv')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/cv' })
    )
  })
})
