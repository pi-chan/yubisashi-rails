import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../popover'
import type { YubisashiPopover } from '../popover'

const createElement = (props: Partial<Record<string, unknown>> = {}): YubisashiPopover => {
  const el = document.createElement('yubisashi-popover') as YubisashiPopover
  Object.assign(el, props)
  document.body.appendChild(el)
  return el
}

describe('YubisashiPopover', () => {
  let el: YubisashiPopover

  afterEach(() => {
    el?.remove()
  })

  it('renders popover with file path', async () => {
    el = createElement({ filePath: 'app/views/users/show.html.erb' })
    await el.updateComplete

    const filePath = el.shadowRoot?.querySelector('.file-path')
    expect(filePath?.textContent).toBe('app/views/users/show.html.erb')
  })

  it('renders header text', async () => {
    el = createElement()
    await el.updateComplete

    const header = el.shadowRoot?.querySelector('.header')
    expect(header?.textContent).toBe('Add annotation')
  })

  it('renders textarea with placeholder', async () => {
    el = createElement()
    await el.updateComplete

    const textarea = el.shadowRoot?.querySelector('textarea')
    expect(textarea).toBeTruthy()
    expect(textarea?.placeholder).toBe('What should be changed?')
  })

  it('renders selected text when provided', async () => {
    el = createElement({ selectedText: 'selected content' })
    await el.updateComplete

    const label = el.shadowRoot?.querySelector('.selected-text-label')
    const text = el.shadowRoot?.querySelector('.selected-text')
    expect(label?.textContent).toBe('Selected text')
    expect(text?.textContent).toBe('selected content')
  })

  it('does not render selected text section when empty', async () => {
    el = createElement({ selectedText: '' })
    await el.updateComplete

    const label = el.shadowRoot?.querySelector('.selected-text-label')
    expect(label).toBeNull()
  })

  it('dispatches submit event with comment on button click', async () => {
    el = createElement()
    await el.updateComplete

    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'Fix the button'

    const handler = vi.fn()
    el.addEventListener('submit', handler)

    const submitBtn = el.shadowRoot?.querySelector('.btn-submit') as HTMLButtonElement
    submitBtn.click()

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.comment).toBe('Fix the button')
  })

  it('dispatches cancel event on cancel button click', async () => {
    el = createElement()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('cancel', handler)

    const cancelBtn = el.shadowRoot?.querySelector('.btn-cancel') as HTMLButtonElement
    cancelBtn.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches submit on Ctrl+Enter keydown', async () => {
    el = createElement()
    await el.updateComplete

    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'keyboard submit'

    const handler = vi.fn()
    el.addEventListener('submit', handler)

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
    })
    textarea.dispatchEvent(event)

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.comment).toBe('keyboard submit')
  })

  it('dispatches cancel on Escape keydown', async () => {
    el = createElement()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('cancel', handler)

    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    textarea.dispatchEvent(event)

    expect(handler).toHaveBeenCalledOnce()
  })

  it('stops propagation on click within popover', async () => {
    el = createElement()
    await el.updateComplete

    const outerHandler = vi.fn()
    document.addEventListener('click', outerHandler)

    const popover = el.shadowRoot?.querySelector('.popover') as HTMLElement
    popover.click()

    document.removeEventListener('click', outerHandler)
    expect(outerHandler).not.toHaveBeenCalled()
  })

  it('trims whitespace from comment on submit', async () => {
    el = createElement()
    await el.updateComplete

    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = '  trimmed comment  '

    const handler = vi.fn()
    el.addEventListener('submit', handler)

    const submitBtn = el.shadowRoot?.querySelector('.btn-submit') as HTMLButtonElement
    submitBtn.click()

    expect(handler.mock.calls[0][0].detail.comment).toBe('trimmed comment')
  })

  it('adjusts position to stay within viewport', async () => {
    el = createElement({ x: 10, y: 10 })
    await el.updateComplete

    await new Promise((r) => requestAnimationFrame(r))

    expect(el.style.left).toBeTruthy()
    expect(el.style.top).toBeTruthy()
  })

  it('stops mousemove propagation', async () => {
    el = createElement()
    await el.updateComplete

    const outerHandler = vi.fn()
    document.addEventListener('mousemove', outerHandler)

    const popover = el.shadowRoot?.querySelector('.popover') as HTMLElement
    popover.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

    document.removeEventListener('mousemove', outerHandler)
    expect(outerHandler).not.toHaveBeenCalled()
  })
})
