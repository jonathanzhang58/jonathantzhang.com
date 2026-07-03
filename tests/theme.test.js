import { describe, it, expect, beforeEach } from 'vitest'
import { initTheme, toggleTheme, getTheme } from '../src/theme.js'

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('theme', () => {
  it('initTheme defaults to light when nothing saved and no system preference', () => {
    initTheme()
    expect(getTheme()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('initTheme respects a saved theme', () => {
    localStorage.setItem('theme', 'dark')
    initTheme()
    expect(getTheme()).toBe('dark')
  })

  it('toggleTheme flips the theme and persists it', () => {
    initTheme()
    toggleTheme()
    expect(getTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    toggleTheme()
    expect(getTheme()).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
