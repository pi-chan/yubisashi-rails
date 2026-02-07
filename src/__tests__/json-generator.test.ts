import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateJson } from '../json-generator'
import type { Annotation } from '../types'

const createAnnotation = (overrides: Partial<Annotation> = {}): Annotation => ({
  id: 1,
  comment: 'Test annotation',
  element: {
    tagName: 'div',
    selector: '.test-element',
    classes: ['test-element'],
    text: 'Hello world',
    boundingBox: { x: 10, y: 20, width: 100, height: 50 },
    dataAttributes: {},
  },
  source: {
    file: 'app/views/users/show.html.erb',
    absolutePath: '/app/views/users/show.html.erb',
  },
  timestamp: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('generateJson', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns valid JSON string', () => {
    const annotations = [createAnnotation()]
    const result = generateJson(annotations, 'http://localhost:3000')

    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('returns empty annotations array for no annotations', () => {
    const result = generateJson([], 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations).toEqual([])
    expect(parsed.page).toBe('http://localhost:3000')
  })

  it('includes page URL and timestamp at top level', () => {
    const annotations = [createAnnotation()]
    const result = generateJson(annotations, 'http://localhost:3000/users')
    const parsed = JSON.parse(result)

    expect(parsed.page).toBe('http://localhost:3000/users')
    expect(parsed.timestamp).toBe('2025-06-01T12:00:00.000Z')
  })

  it('includes annotation id and comment', () => {
    const annotations = [createAnnotation({ id: 3, comment: 'User profile card' })]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations[0].id).toBe(3)
    expect(parsed.annotations[0].comment).toBe('User profile card')
  })

  it('includes element details', () => {
    const annotations = [createAnnotation()]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)
    const elem = parsed.annotations[0].element

    expect(elem.tagName).toBe('div')
    expect(elem.selector).toBe('.test-element')
    expect(elem.classes).toEqual(['test-element'])
    expect(elem.text).toBe('Hello world')
    expect(elem.boundingBox).toEqual({ x: 10, y: 20, width: 100, height: 50 })
    expect(elem.dataAttributes).toEqual({})
  })

  it('includes source details', () => {
    const annotations = [createAnnotation()]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)
    const source = parsed.annotations[0].source

    expect(source.file).toBe('app/views/users/show.html.erb')
    expect(source.absolutePath).toBe('/app/views/users/show.html.erb')
  })

  it('includes selectedText when present', () => {
    const annotations = [createAnnotation({
      element: {
        tagName: 'div',
        selector: '.foo',
        classes: [],
        text: 'Full text',
        selectedText: 'selected part',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations[0].element.selectedText).toBe('selected part')
  })

  it('includes data attributes when present', () => {
    const annotations = [createAnnotation({
      element: {
        tagName: 'div',
        selector: '.foo',
        classes: [],
        text: '',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: { 'data-controller': 'modal', 'data-action': 'click->modal#open' },
      },
    })]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations[0].element.dataAttributes).toEqual({
      'data-controller': 'modal',
      'data-action': 'click->modal#open',
    })
  })

  it('formats multiple annotations', () => {
    const annotations = [
      createAnnotation({ id: 1, comment: 'First' }),
      createAnnotation({ id: 2, comment: 'Second' }),
    ]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations).toHaveLength(2)
    expect(parsed.annotations[0].id).toBe(1)
    expect(parsed.annotations[0].comment).toBe('First')
    expect(parsed.annotations[1].id).toBe(2)
    expect(parsed.annotations[1].comment).toBe('Second')
  })

  it('produces pretty-printed JSON with 2-space indent', () => {
    const annotations = [createAnnotation()]
    const result = generateJson(annotations, 'http://localhost:3000')

    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })

  it('includes annotation timestamp', () => {
    const annotations = [createAnnotation({ timestamp: '2025-03-15T10:30:00.000Z' })]
    const result = generateJson(annotations, 'http://localhost:3000')
    const parsed = JSON.parse(result)

    expect(parsed.annotations[0].timestamp).toBe('2025-03-15T10:30:00.000Z')
  })
})
