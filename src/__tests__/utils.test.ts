import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isCombo, throttle, truncateText, collectDataAttributes, getBoundingBox } from '../utils'

describe('isCombo', () => {
  const createKeyboardEvent = (
    key: string,
    modifiers: { shift?: boolean; ctrl?: boolean; alt?: boolean; meta?: boolean } = {},
  ): KeyboardEvent => {
    const { shift = false, ctrl = false, alt = false, meta = false } = modifiers
    return new KeyboardEvent('keydown', {
      key,
      shiftKey: shift,
      ctrlKey: ctrl,
      altKey: alt,
      metaKey: meta,
    })
  }

  it('matches single key', () => {
    const event = createKeyboardEvent('a')
    expect(isCombo('a', event)).toBe(true)
  })

  it('does not match different key', () => {
    const event = createKeyboardEvent('b')
    expect(isCombo('a', event)).toBe(false)
  })

  it('matches shift + key combo', () => {
    const event = createKeyboardEvent('A', { shift: true })
    expect(isCombo('shift-a', event)).toBe(true)
  })

  it('matches command alias for meta', () => {
    const event = createKeyboardEvent('k', { meta: true })
    expect(isCombo('command-k', event)).toBe(true)
  })

  it('is case-insensitive for key matching', () => {
    const event = createKeyboardEvent('K', { meta: true })
    expect(isCombo('command-k', event)).toBe(true)
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls function immediately on first invocation', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('suppresses calls within throttle window', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows call after throttle window passes', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('passes arguments to the throttled function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled(42, 'hello')
    expect(fn).toHaveBeenCalledWith(42, 'hello')
  })
})

describe('truncateText', () => {
  it('returns trimmed text when under max length', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('trims whitespace', () => {
    expect(truncateText('  hello  ', 10)).toBe('hello')
  })

  it('collapses internal whitespace', () => {
    expect(truncateText('hello   world', 20)).toBe('hello world')
  })

  it('truncates with ellipsis when exceeding max length', () => {
    expect(truncateText('hello world this is a long text', 11)).toBe('hello world...')
  })

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })

  it('handles string exactly at max length', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })
})

describe('collectDataAttributes', () => {
  it('collects all data- attributes', () => {
    const el = document.createElement('div')
    el.setAttribute('data-controller', 'modal')
    el.setAttribute('data-action', 'click->modal#open')
    el.setAttribute('class', 'foo')
    el.setAttribute('id', 'bar')

    const attrs = collectDataAttributes(el)
    expect(attrs).toEqual({
      'data-controller': 'modal',
      'data-action': 'click->modal#open',
    })
  })

  it('returns empty object when no data attributes', () => {
    const el = document.createElement('div')
    el.setAttribute('class', 'foo')

    expect(collectDataAttributes(el)).toEqual({})
  })

  it('handles element with no attributes', () => {
    const el = document.createElement('div')
    expect(collectDataAttributes(el)).toEqual({})
  })
})

describe('getBoundingBox', () => {
  it('returns rounded bounding box values', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const box = getBoundingBox(el)
    expect(box).toHaveProperty('x')
    expect(box).toHaveProperty('y')
    expect(box).toHaveProperty('width')
    expect(box).toHaveProperty('height')
    expect(Number.isInteger(box.x)).toBe(true)
    expect(Number.isInteger(box.y)).toBe(true)
    expect(Number.isInteger(box.width)).toBe(true)
    expect(Number.isInteger(box.height)).toBe(true)
  })
})
