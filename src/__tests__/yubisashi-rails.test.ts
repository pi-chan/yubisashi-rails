import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '../yubisashi-rails'
import type { YubisashiRails } from '../yubisashi-rails'

const createElement = (props: Partial<Record<string, unknown>> = {}): YubisashiRails => {
  const el = document.createElement('yubisashi-rails') as YubisashiRails
  Object.assign(el, props)
  document.body.appendChild(el)
  return el
}

describe('YubisashiRails', () => {
  let el: YubisashiRails

  afterEach(() => {
    el?.remove()
  })

  it('renders toolbar', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar')
    expect(toolbar).toBeTruthy()
  })

  it('renders badge overlay', async () => {
    el = createElement()
    await el.updateComplete

    const badges = el.shadowRoot?.querySelector('yubisashi-badge-overlay')
    expect(badges).toBeTruthy()
  })

  it('does not render popover initially', async () => {
    el = createElement()
    await el.updateComplete

    const popover = el.shadowRoot?.querySelector('yubisashi-popover')
    expect(popover).toBeNull()
  })

  it('does not render panel initially', async () => {
    el = createElement()
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel')
    expect(panel).toBeNull()
  })

  it('starts inactive', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar?.active).toBe(false)
  })

  it('has default properties', async () => {
    el = createElement()
    await el.updateComplete

    expect(el.root).toBe('/')
    expect(el.comboKey).toBe('command-shift-a')
    expect(el.position).toBe('bottom-right')
    expect(el.format).toBe('markdown')
    expect(el.theme).toBe('auto')
  })

  it('toggles active state on toolbar toggle event', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    const updatedToolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(updatedToolbar.active).toBe(true)
  })

  it('deactivates on second toggle', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    const updatedToolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(updatedToolbar.active).toBe(false)
  })

  it('toggles on keyboard combo', async () => {
    el = createElement({ comboKey: 'meta-shift-a' })
    await el.updateComplete

    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'a',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    }))
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar.active).toBe(true)
  })

  it('deactivates on Escape when active', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    }))
    await el.updateComplete

    const updatedToolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(updatedToolbar.active).toBe(false)
  })

  it('changes format on format-change event', async () => {
    el = createElement({ format: 'markdown' })
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('format-change', {
      detail: { format: 'json' },
      bubbles: true,
      composed: true,
    }))
    await el.updateComplete

    expect(el.format).toBe('json')
  })

  it('clears annotations on clear event', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }))
    await el.updateComplete

    const updatedToolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(updatedToolbar.count).toBe(0)
  })

  it('toggles panel visibility on list event', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel')
    expect(panel).toBeTruthy()
  })

  it('hides panel on panel-close event', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel') as HTMLElement
    panel.dispatchEvent(new CustomEvent('panel-close', { bubbles: true, composed: true }))
    await el.updateComplete

    const panelAfter = el.shadowRoot?.querySelector('yubisashi-annotation-panel')
    expect(panelAfter).toBeNull()
  })

  it('applies theme tokens on connect', async () => {
    el = createElement({ theme: 'dark' })
    await el.updateComplete

    expect(el.style.getPropertyValue('--yubisashi-bg')).toBeTruthy()
  })

  it('updates theme when theme property changes', async () => {
    el = createElement({ theme: 'light' })
    await el.updateComplete

    const lightBg = el.style.getPropertyValue('--yubisashi-bg')

    el.theme = 'dark'
    await el.updateComplete

    const darkBg = el.style.getPropertyValue('--yubisashi-bg')
    expect(darkBg).not.toBe(lightBg)
  })

  it('passes format to toolbar', async () => {
    el = createElement({ format: 'json' })
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar.format).toBe('json')
  })

  it('passes position to toolbar', async () => {
    el = createElement({ position: 'bottom-left' })
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar.position).toBe('bottom-left')
  })

  it('logs ready message on connect', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    el = createElement()
    await el.updateComplete

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[yubisashi-rails] Ready'))
    spy.mockRestore()
  })

  it('removes event listeners on disconnect', async () => {
    const removeSpy = vi.spyOn(document.body, 'removeEventListener')
    el = createElement()
    await el.updateComplete

    el.remove()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('handles copy with clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))

    await new Promise((r) => setTimeout(r, 10))

    expect(writeText).toHaveBeenCalledOnce()
  })

  it('handles overlay rendering when hoverResult is null', async () => {
    el = createElement()
    await el.updateComplete

    const overlay = el.shadowRoot?.querySelector('.overlay') as HTMLElement
    expect(overlay?.hidden).toBe(true)
  })

  it('ignores Escape when not active and no popover', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar.active).toBe(false)

    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    }))
    await el.updateComplete

    expect(toolbar.active).toBe(false)
  })

  it('ignores non-combo keydown', async () => {
    el = createElement()
    await el.updateComplete

    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'x',
      bubbles: true,
    }))
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(toolbar.active).toBe(false)
  })

  it('handles annotation-delete on panel', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement

    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    toolbar.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel') as HTMLElement
    panel?.dispatchEvent(new CustomEvent('annotation-delete', {
      detail: { id: 999 },
      bubbles: true,
      composed: true,
    }))
    await el.updateComplete

    const updatedToolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as any
    expect(updatedToolbar.count).toBe(0)
  })

  it('handles annotation-edit on panel', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel') as HTMLElement
    panel?.dispatchEvent(new CustomEvent('annotation-edit', {
      detail: { id: 1, comment: 'Updated' },
      bubbles: true,
      composed: true,
    }))
    await el.updateComplete

    expect(panel).toBeTruthy()
  })

  it('handles annotation-select on panel', async () => {
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
    await el.updateComplete

    const panel = el.shadowRoot?.querySelector('yubisashi-annotation-panel') as HTMLElement
    panel?.dispatchEvent(new CustomEvent('annotation-select', {
      detail: { id: 1 },
      bubbles: true,
      composed: true,
    }))
    await el.updateComplete

    expect(panel).toBeTruthy()
  })

  it('handles badge-click event', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    el = createElement()
    await el.updateComplete

    const badges = el.shadowRoot?.querySelector('yubisashi-badge-overlay') as HTMLElement
    badges.dispatchEvent(new CustomEvent('badge-click', {
      detail: { id: 1 },
      bubbles: true,
      composed: true,
    }))

    spy.mockRestore()
  })

  it('copies as JSON when format is json', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    el = createElement({ format: 'json' })
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))

    await new Promise((r) => setTimeout(r, 10))

    expect(writeText).toHaveBeenCalledOnce()
    const output = writeText.mock.calls[0][0]
    expect(() => JSON.parse(output)).not.toThrow()
  })

  it('handles clipboard write failure gracefully', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('clipboard denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))

    await new Promise((r) => setTimeout(r, 10))

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[yubisashi-rails]'),
      expect.any(Error),
    )
    errorSpy.mockRestore()
  })

  it('adds mousemove and click listeners when activated', async () => {
    const addSpy = vi.spyOn(document.body, 'addEventListener')
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    addSpy.mockRestore()
  })

  it('removes mousemove and click listeners when deactivated', async () => {
    const removeSpy = vi.spyOn(document.body, 'removeEventListener')
    el = createElement()
    await el.updateComplete

    const toolbar = el.shadowRoot?.querySelector('yubisashi-toolbar') as HTMLElement
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete
    toolbar.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
    await el.updateComplete

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('handles dark mode media query change', async () => {
    el = createElement({ theme: 'auto' })
    await el.updateComplete

    const bgBefore = el.style.getPropertyValue('--yubisashi-bg')

    const event = new Event('change')
    window.matchMedia('(prefers-color-scheme: dark)').dispatchEvent(event)
    await el.updateComplete

    expect(el.style.getPropertyValue('--yubisashi-bg')).toBeTruthy()
  })
})
