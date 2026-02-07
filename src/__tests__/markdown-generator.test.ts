import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateMarkdown } from '../markdown-generator'
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

describe('generateMarkdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string for empty annotations', () => {
    expect(generateMarkdown([], 'http://localhost:3000')).toBe('')
  })

  it('generates header with page URL and timestamp', () => {
    const annotations = [createAnnotation()]
    const result = generateMarkdown(annotations, 'http://localhost:3000/users')

    expect(result).toContain('# UI Annotations')
    expect(result).toContain('> Page: http://localhost:3000/users')
    expect(result).toContain('> Timestamp: 2025-06-01T12:00:00.000Z')
  })

  it('formats annotation with id and comment', () => {
    const annotations = [createAnnotation({ id: 3, comment: 'User profile card' })]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('## #3 User profile card')
  })

  it('includes file and selector', () => {
    const annotations = [createAnnotation()]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('- **File**: `app/views/users/show.html.erb`')
    expect(result).toContain('- **Selector**: `.test-element`')
  })

  it('includes classes when present', () => {
    const annotations = [createAnnotation({
      element: {
        tagName: 'div',
        selector: '.foo',
        classes: ['foo', 'bar'],
        text: '',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('- **Classes**: `foo bar`')
  })

  it('omits classes when empty', () => {
    const annotations = [createAnnotation({
      element: {
        tagName: 'div',
        selector: '.foo',
        classes: [],
        text: '',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).not.toContain('**Classes**')
  })

  it('includes text when present', () => {
    const annotations = [createAnnotation()]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('- **Text**: "Hello world"')
  })

  it('includes selected text when present', () => {
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
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('- **Selected text**: "selected part"')
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
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('data-controller="modal"')
    expect(result).toContain('data-action="click->modal#open"')
  })

  it('includes bounding box', () => {
    const annotations = [createAnnotation()]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('- **Bounding box**: x=10, y=20, w=100, h=50')
  })

  it('formats multiple annotations', () => {
    const annotations = [
      createAnnotation({ id: 1, comment: 'First' }),
      createAnnotation({ id: 2, comment: 'Second' }),
    ]
    const result = generateMarkdown(annotations, 'http://localhost:3000')

    expect(result).toContain('## #1 First')
    expect(result).toContain('## #2 Second')
  })
})
