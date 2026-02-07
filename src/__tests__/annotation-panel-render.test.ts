import { describe, it, expect, vi, afterEach } from 'vitest'
import '../annotation-panel'
import type { YubisashiAnnotationPanel } from '../annotation-panel'
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

const createElement = (props: Partial<Record<string, unknown>> = {}): YubisashiAnnotationPanel => {
  const el = document.createElement('yubisashi-annotation-panel') as YubisashiAnnotationPanel
  Object.assign(el, props)
  document.body.appendChild(el)
  return el
}

describe('YubisashiAnnotationPanel rendering', () => {
  let el: YubisashiAnnotationPanel

  afterEach(() => {
    el?.remove()
  })

  it('renders panel header with title', async () => {
    el = createElement()
    await el.updateComplete

    const title = el.shadowRoot?.querySelector('.panel-title')
    expect(title?.textContent).toBe('Annotations')
  })

  it('renders annotation count', async () => {
    const annotations = [createAnnotation({ id: 1 }), createAnnotation({ id: 2 })]
    el = createElement({ annotations })
    await el.updateComplete

    const count = el.shadowRoot?.querySelector('.panel-count')
    expect(count?.textContent).toContain('2')
  })

  it('shows empty state when no annotations', async () => {
    el = createElement({ annotations: [] })
    await el.updateComplete

    const empty = el.shadowRoot?.querySelector('.empty-state')
    expect(empty?.textContent).toContain('No annotations yet')
  })

  it('renders annotation cards', async () => {
    const annotations = [
      createAnnotation({ id: 1, comment: 'First' }),
      createAnnotation({ id: 2, comment: 'Second' }),
    ]
    el = createElement({ annotations })
    await el.updateComplete

    const cards = el.shadowRoot?.querySelectorAll('.annotation-card')
    expect(cards?.length).toBe(2)
  })

  it('renders card with id, comment, file and selector', async () => {
    const annotations = [createAnnotation({ id: 3, comment: 'Fix button' })]
    el = createElement({ annotations })
    await el.updateComplete

    const card = el.shadowRoot?.querySelector('.annotation-card')
    const idEl = card?.querySelector('.card-id')
    const commentEl = card?.querySelector('.card-comment')
    const fileEl = card?.querySelector('.card-file')
    const selectorEl = card?.querySelector('.card-selector')

    expect(idEl?.textContent?.trim()).toBe('3')
    expect(commentEl?.textContent).toBe('Fix button')
    expect(fileEl?.textContent).toBe('app/views/users/show.html.erb')
    expect(selectorEl?.textContent).toBe('.test-element')
  })

  it('renders selected text when present', async () => {
    const annotations = [createAnnotation({
      element: {
        tagName: 'p',
        selector: '.text',
        classes: [],
        text: 'Full text',
        selectedText: 'partial',
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        dataAttributes: {},
      },
    })]
    el = createElement({ annotations })
    await el.updateComplete

    const selectedText = el.shadowRoot?.querySelector('.card-selected-text')
    expect(selectedText?.textContent).toBe('partial')
  })

  it('does not render selected text section when absent', async () => {
    const annotations = [createAnnotation()]
    el = createElement({ annotations })
    await el.updateComplete

    const selectedText = el.shadowRoot?.querySelector('.card-selected-text')
    expect(selectedText).toBeNull()
  })

  it('dispatches panel-close event on close button click', async () => {
    el = createElement()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('panel-close', handler)

    const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement
    closeBtn.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches annotation-select on card click', async () => {
    const annotations = [createAnnotation({ id: 5 })]
    el = createElement({ annotations })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('annotation-select', handler)

    const card = el.shadowRoot?.querySelector('.annotation-card') as HTMLElement
    card.click()

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.id).toBe(5)
  })

  it('dispatches annotation-delete on delete button click', async () => {
    const annotations = [createAnnotation({ id: 7 })]
    el = createElement({ annotations })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('annotation-delete', handler)

    const deleteBtn = el.shadowRoot?.querySelector('.card-btn.delete') as HTMLButtonElement
    deleteBtn.click()

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.id).toBe(7)
  })

  it('enters edit mode on edit button click', async () => {
    const annotations = [createAnnotation({ id: 1, comment: 'Original' })]
    el = createElement({ annotations })
    await el.updateComplete

    const editBtns = el.shadowRoot?.querySelectorAll('.card-btn') as NodeListOf<HTMLButtonElement>
    const editBtn = Array.from(editBtns).find((b) => b.title === 'Edit')
    editBtn?.click()

    await el.updateComplete

    const input = el.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('Original')
  })

  it('commits edit on Enter key', async () => {
    const annotations = [createAnnotation({ id: 1, comment: 'Original' })]
    el = createElement({ annotations })
    await el.updateComplete

    const editBtns = el.shadowRoot?.querySelectorAll('.card-btn') as NodeListOf<HTMLButtonElement>
    const editBtn = Array.from(editBtns).find((b) => b.title === 'Edit')
    editBtn?.click()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('annotation-edit', handler)

    const input = el.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement
    input.value = 'Updated comment'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await el.updateComplete

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.comment).toBe('Updated comment')
  })

  it('cancels edit on Escape key', async () => {
    const annotations = [createAnnotation({ id: 1, comment: 'Original' })]
    el = createElement({ annotations })
    await el.updateComplete

    const editBtns = el.shadowRoot?.querySelectorAll('.card-btn') as NodeListOf<HTMLButtonElement>
    const editBtn = Array.from(editBtns).find((b) => b.title === 'Edit')
    editBtn?.click()
    await el.updateComplete

    const input = el.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement
    expect(input).toBeTruthy()

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await el.updateComplete

    const inputAfter = el.shadowRoot?.querySelector('.card-comment-input')
    expect(inputAfter).toBeNull()

    const comment = el.shadowRoot?.querySelector('.card-comment')
    expect(comment?.textContent).toBe('Original')
  })

  it('does not commit empty comment', async () => {
    const annotations = [createAnnotation({ id: 1, comment: 'Original' })]
    el = createElement({ annotations })
    await el.updateComplete

    const editBtns = el.shadowRoot?.querySelectorAll('.card-btn') as NodeListOf<HTMLButtonElement>
    const editBtn = Array.from(editBtns).find((b) => b.title === 'Edit')
    editBtn?.click()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('annotation-edit', handler)

    const input = el.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement
    input.value = '   '
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await el.updateComplete

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('stops keydown propagation during edit', async () => {
    const annotations = [createAnnotation({ id: 1, comment: 'Original' })]
    el = createElement({ annotations })
    await el.updateComplete

    const editBtns = el.shadowRoot?.querySelectorAll('.card-btn') as NodeListOf<HTMLButtonElement>
    const editBtn = Array.from(editBtns).find((b) => b.title === 'Edit')
    editBtn?.click()
    await el.updateComplete

    const outerHandler = vi.fn()
    document.addEventListener('keydown', outerHandler)

    const input = el.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))

    document.removeEventListener('keydown', outerHandler)
    expect(outerHandler).not.toHaveBeenCalled()
  })
})
