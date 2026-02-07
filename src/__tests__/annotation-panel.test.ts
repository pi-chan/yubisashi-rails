import { describe, it, expect } from 'vitest'
import { formatAnnotationSummary, type AnnotationSummary } from '../annotation-panel'
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

describe('formatAnnotationSummary', () => {
  it('formats annotation with comment', () => {
    const annotation = createAnnotation({ id: 3, comment: 'Fix button color' })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.id).toBe(3)
    expect(summary.comment).toBe('Fix button color')
    expect(summary.file).toBe('app/views/users/show.html.erb')
    expect(summary.selector).toBe('.test-element')
    expect(summary.tagName).toBe('div')
  })

  it('truncates long comments', () => {
    const longComment = 'a'.repeat(100)
    const annotation = createAnnotation({ comment: longComment })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.comment.length).toBeLessThanOrEqual(83)
    expect(summary.comment).toContain('...')
  })

  it('includes selected text when present', () => {
    const annotation = createAnnotation({
      element: {
        tagName: 'p',
        selector: '.text',
        classes: ['text'],
        text: 'Full text here',
        selectedText: 'selected part',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.selectedText).toBe('selected part')
  })

  it('returns undefined for selectedText when not present', () => {
    const annotation = createAnnotation()
    const summary = formatAnnotationSummary(annotation)

    expect(summary.selectedText).toBeUndefined()
  })

  it('extracts short filename from full path', () => {
    const annotation = createAnnotation({
      source: {
        file: 'app/views/users/show.html.erb',
        absolutePath: '/app/views/users/show.html.erb',
      },
    })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.shortFile).toBe('show.html.erb')
  })

  it('handles root-level file for shortFile', () => {
    const annotation = createAnnotation({
      source: {
        file: 'index.html.erb',
        absolutePath: '/index.html.erb',
      },
    })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.shortFile).toBe('index.html.erb')
  })

  it('preserves element text', () => {
    const annotation = createAnnotation({
      element: {
        tagName: 'span',
        selector: '.label',
        classes: ['label'],
        text: 'Click me',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })
    const summary = formatAnnotationSummary(annotation)

    expect(summary.text).toBe('Click me')
  })
})

describe('AnnotationSummary type', () => {
  it('has required fields', () => {
    const item: AnnotationSummary = {
      id: 1,
      comment: 'test',
      file: 'app/views/index.html.erb',
      shortFile: 'index.html.erb',
      selector: 'div.main',
      tagName: 'div',
      text: 'Hello',
    }

    expect(item.id).toBe(1)
    expect(item.shortFile).toBe('index.html.erb')
  })
})
