import { describe, it, expect, beforeEach } from 'vitest'
import { findTemplate } from '../comment-parser'

const createComment = (text: string): Comment => {
  return document.createComment(` ${text} `)
}

describe('findTemplate', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.replaceChildren()
    document.body.appendChild(container)
  })

  it('returns undefined when no comment exists', () => {
    const el = document.createElement('div')
    container.appendChild(el)

    expect(findTemplate(el, '/app')).toBeUndefined()
  })

  it('finds a BEGIN comment before the element', () => {
    const comment = createComment('BEGIN /app/views/users/show.html.erb')
    const el = document.createElement('div')
    container.appendChild(comment)
    container.appendChild(el)

    const result = findTemplate(el, '/app')!
    expect(result).toBeDefined()
    expect(result.path).toBe('views/users/show.html.erb')
    expect(result.absolutePath).toBe('/app/views/users/show.html.erb')
    expect(result.element).toBe(el)
  })

  it('skips END/BEGIN pairs for the same path', () => {
    const beginOuter = createComment('BEGIN /app/views/layouts/application.html.erb')
    const beginInner = createComment('BEGIN /app/views/users/show.html.erb')
    const endInner = createComment('END /app/views/users/show.html.erb')
    const el = document.createElement('div')

    container.appendChild(beginOuter)
    container.appendChild(beginInner)
    container.appendChild(endInner)
    container.appendChild(el)

    const result = findTemplate(el, '/app')!
    expect(result).toBeDefined()
    expect(result.path).toBe('views/layouts/application.html.erb')
  })

  it('traverses up to parent elements', () => {
    const comment = createComment('BEGIN /app/views/users/index.html.erb')
    const parent = document.createElement('div')
    const child = document.createElement('span')
    parent.appendChild(child)

    container.appendChild(comment)
    container.appendChild(parent)

    const result = findTemplate(child, '/app')!
    expect(result).toBeDefined()
    expect(result.path).toBe('views/users/index.html.erb')
    expect(result.element).toBe(parent)
  })

  it('returns absolute path when root does not match', () => {
    const comment = createComment('BEGIN /other/path/views/show.html.erb')
    const el = document.createElement('div')
    container.appendChild(comment)
    container.appendChild(el)

    const result = findTemplate(el, '/app')!
    expect(result).toBeDefined()
    expect(result.path).toBe('/other/path/views/show.html.erb')
    expect(result.absolutePath).toBe('/other/path/views/show.html.erb')
  })

  it('handles root with trailing slash', () => {
    const comment = createComment('BEGIN /app/views/show.html.erb')
    const el = document.createElement('div')
    container.appendChild(comment)
    container.appendChild(el)

    const result = findTemplate(el, '/app/')!
    expect(result).toBeDefined()
    expect(result.path).toBe('views/show.html.erb')
  })

  it('ignores non-annotate comments', () => {
    const regularComment = createComment('some regular comment')
    const el = document.createElement('div')
    container.appendChild(regularComment)
    container.appendChild(el)

    expect(findTemplate(el, '/app')).toBeUndefined()
  })

  it('finds closest template when multiple BEGIN comments exist', () => {
    const comment1 = createComment('BEGIN /app/views/layouts/application.html.erb')
    const el1 = document.createElement('div')
    const comment2 = createComment('BEGIN /app/views/users/show.html.erb')
    const el2 = document.createElement('span')

    container.appendChild(comment1)
    container.appendChild(el1)
    container.appendChild(comment2)
    container.appendChild(el2)

    const result = findTemplate(el2, '/app')!
    expect(result).toBeDefined()
    expect(result.path).toBe('views/users/show.html.erb')
  })
})
