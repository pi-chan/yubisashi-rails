import { describe, it, expect } from 'vitest'
import { resolveTheme, LIGHT_TOKENS, DARK_TOKENS } from '../theme'

describe('resolveTheme', () => {
  it('returns "light" when theme is "light"', () => {
    expect(resolveTheme('light', false)).toBe('light')
  })

  it('returns "dark" when theme is "dark"', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('returns "light" when theme is "auto" and system is light', () => {
    expect(resolveTheme('auto', false)).toBe('light')
  })

  it('returns "dark" when theme is "auto" and system is dark', () => {
    expect(resolveTheme('auto', true)).toBe('dark')
  })
})

describe('LIGHT_TOKENS', () => {
  it('has all required token keys', () => {
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-bg')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-text')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-border')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-primary')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-primary-text')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-muted')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-hover')
    expect(LIGHT_TOKENS).toHaveProperty('--yubisashi-shadow')
  })
})

describe('DARK_TOKENS', () => {
  it('has all required token keys', () => {
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-bg')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-text')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-border')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-primary')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-primary-text')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-muted')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-hover')
    expect(DARK_TOKENS).toHaveProperty('--yubisashi-shadow')
  })

  it('uses different values from light tokens', () => {
    expect(DARK_TOKENS['--yubisashi-bg']).not.toBe(LIGHT_TOKENS['--yubisashi-bg'])
    expect(DARK_TOKENS['--yubisashi-text']).not.toBe(LIGHT_TOKENS['--yubisashi-text'])
  })
})
