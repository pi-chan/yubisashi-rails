import { describe, it, expect, vi, afterEach } from 'vitest'
import '../toolbar'
import type { YubisashiToolbar } from '../toolbar'

const createElement = (props: Partial<Record<string, unknown>> = {}): YubisashiToolbar => {
  const el = document.createElement('yubisashi-toolbar') as YubisashiToolbar
  Object.assign(el, props)
  document.body.appendChild(el)
  return el
}

describe('YubisashiToolbar', () => {
  let el: YubisashiToolbar

  afterEach(() => {
    el?.remove()
  })

  it('renders toolbar with title', async () => {
    el = createElement()
    await el.updateComplete

    const title = el.shadowRoot?.querySelector('.title')
    expect(title?.textContent).toBe('yubisashi')
  })

  it('displays annotation count', async () => {
    el = createElement({ count: 5 })
    await el.updateComplete

    const count = el.shadowRoot?.querySelector('.count')
    expect(count?.textContent?.trim()).toBe('5')
    expect(count?.classList.contains('empty')).toBe(false)
  })

  it('shows empty class when count is 0', async () => {
    el = createElement({ count: 0 })
    await el.updateComplete

    const count = el.shadowRoot?.querySelector('.count')
    expect(count?.classList.contains('empty')).toBe(true)
  })

  it('shows active state when active', async () => {
    el = createElement({ active: true })
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('.toolbar')
    expect(toolbar?.classList.contains('active')).toBe(true)

    const toggle = el.shadowRoot?.querySelector('.toggle')
    expect(toggle?.classList.contains('active')).toBe(true)
  })

  it('shows inactive state by default', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('.toolbar')
    expect(toolbar?.classList.contains('active')).toBe(false)
  })

  it('dispatches toggle event on toggle button click', async () => {
    el = createElement()
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('toggle', handler)

    const toggle = el.shadowRoot?.querySelector('.toggle') as HTMLButtonElement
    toggle.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches format-change event on format toggle click', async () => {
    el = createElement({ format: 'markdown' })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('format-change', handler)

    const formatToggle = el.shadowRoot?.querySelector('.format-toggle') as HTMLElement
    formatToggle.click()

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.format).toBe('json')
  })

  it('toggles format from json to markdown', async () => {
    el = createElement({ format: 'json' })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('format-change', handler)

    const formatToggle = el.shadowRoot?.querySelector('.format-toggle') as HTMLElement
    formatToggle.click()

    expect(handler.mock.calls[0][0].detail.format).toBe('markdown')
  })

  it('displays MD when format is markdown', async () => {
    el = createElement({ format: 'markdown' })
    await el.updateComplete

    const formatToggle = el.shadowRoot?.querySelector('.format-toggle')
    expect(formatToggle?.textContent?.trim()).toBe('MD')
  })

  it('displays JSON when format is json', async () => {
    el = createElement({ format: 'json' })
    await el.updateComplete

    const formatToggle = el.shadowRoot?.querySelector('.format-toggle')
    expect(formatToggle?.textContent?.trim()).toBe('JSON')
  })

  it('dispatches copy event on copy button click', async () => {
    el = createElement({ count: 1 })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('copy', handler)

    const buttons = el.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const copyBtn = Array.from(buttons).find((b) => b.title.includes('Copy'))
    copyBtn?.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches list event on list button click', async () => {
    el = createElement({ count: 1 })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('list', handler)

    const buttons = el.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const listBtn = Array.from(buttons).find((b) => b.title.includes('list'))
    listBtn?.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches clear event on clear button click', async () => {
    el = createElement({ count: 1 })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('clear', handler)

    const buttons = el.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const clearBtn = Array.from(buttons).find((b) => b.title.includes('Clear'))
    clearBtn?.click()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('disables action buttons when count is 0', async () => {
    el = createElement({ count: 0 })
    await el.updateComplete

    const buttons = el.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const copyBtn = Array.from(buttons).find((b) => b.title.includes('Copy'))
    const listBtn = Array.from(buttons).find((b) => b.title.includes('list'))
    const clearBtn = Array.from(buttons).find((b) => b.title.includes('Clear'))

    expect(copyBtn?.disabled).toBe(true)
    expect(listBtn?.disabled).toBe(true)
    expect(clearBtn?.disabled).toBe(true)
  })

  it('enables action buttons when count > 0', async () => {
    el = createElement({ count: 3 })
    await el.updateComplete

    const buttons = el.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const copyBtn = Array.from(buttons).find((b) => b.title.includes('Copy'))

    expect(copyBtn?.disabled).toBe(false)
  })

  it('reflects position attribute', async () => {
    el = createElement({ position: 'bottom-left' })
    await el.updateComplete

    expect(el.getAttribute('position')).toBe('bottom-left')
  })

  it('stops mousemove propagation on toolbar', async () => {
    el = createElement()
    await el.updateComplete

    const outerHandler = vi.fn()
    document.addEventListener('mousemove', outerHandler)

    const toolbar = el.shadowRoot?.querySelector('.toolbar') as HTMLElement
    toolbar.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

    document.removeEventListener('mousemove', outerHandler)
    expect(outerHandler).not.toHaveBeenCalled()
  })
})
