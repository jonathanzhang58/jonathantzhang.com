import { describe, it, expect } from 'vitest'
import { flipDirection } from '../src/animations/pageTransition.js'
import { getPage } from '../src/pages/index.js'

describe('flipDirection', () => {
  it('spins right (+1) when navigating to a later nav item', () => {
    expect(flipDirection(getPage('/research'), getPage('/projects'))).toBe(1)
    expect(flipDirection(getPage('/'), getPage('/contact'))).toBe(1)
  })

  it('spins left (-1) when navigating to an earlier nav item', () => {
    expect(flipDirection(getPage('/research'), getPage('/bio'))).toBe(-1)
    expect(flipDirection(getPage('/contact'), getPage('/'))).toBe(-1)
  })
})
