import { describe, it, expect, vi, afterEach } from 'vitest'
import '../badge-overlay'
import type { YubisashiBadgeOverlay, BadgeItem } from '../badge-overlay'

const createMockElement = (rect: Partial<DOMRect> = {}): HTMLElement => {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({
    x: 100,
    y: 200,
    width: 300,
    height: 150,
    top: 200,
    right: 400,
    bottom: 350,
    left: 100,
    toJSON: () => ({}),
    ...rect,
  })
  return el
}

const createElement = (props: Partial<Record<string, unknown>> = {}): YubisashiBadgeOverlay => {
  const el = document.createElement('yubisashi-badge-overlay') as YubisashiBadgeOverlay
  Object.assign(el, props)
  document.body.appendChild(el)
  return el
}

describe('YubisashiBadgeOverlay rendering', () => {
  let el: YubisashiBadgeOverlay

  afterEach(() => {
    el?.remove()
  })

  it('renders badges for each item', async () => {
    const badges: BadgeItem[] = [
      { id: 1, element: createMockElement() },
      { id: 2, element: createMockElement({ x: 200, y: 300 }) },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const badgeEls = el.shadowRoot?.querySelectorAll('.badge')
    expect(badgeEls?.length).toBe(2)
  })

  it('displays badge id', async () => {
    const badges: BadgeItem[] = [
      { id: 42, element: createMockElement() },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const badge = el.shadowRoot?.querySelector('.badge')
    expect(badge?.textContent?.trim()).toBe('42')
  })

  it('positions badges based on element rect and scroll', async () => {
    const badges: BadgeItem[] = [
      { id: 1, element: createMockElement({ x: 50, y: 80 }) },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement
    expect(badge.style.left).toContain('px')
    expect(badge.style.top).toContain('px')
  })

  it('renders empty when no badges', async () => {
    el = createElement({ badges: [] })
    await el.updateComplete

    const badgeEls = el.shadowRoot?.querySelectorAll('.badge')
    expect(badgeEls?.length).toBe(0)
  })

  it('dispatches badge-click event on badge click', async () => {
    const badges: BadgeItem[] = [
      { id: 5, element: createMockElement() },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const handler = vi.fn()
    el.addEventListener('badge-click', handler)

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement
    badge.click()

    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].detail.id).toBe(5)
  })

  it('sets badge title attribute', async () => {
    const badges: BadgeItem[] = [
      { id: 3, element: createMockElement() },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const badge = el.shadowRoot?.querySelector('.badge')
    expect(badge?.getAttribute('title')).toBe('Annotation #3')
  })

  it('adds resize listener on connect and removes on disconnect', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    el = createElement()
    await el.updateComplete

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function))

    el.remove()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('requests update on resize event', async () => {
    const badges: BadgeItem[] = [
      { id: 1, element: createMockElement() },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const spy = vi.spyOn(el, 'requestUpdate')
    window.dispatchEvent(new Event('resize'))

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('requests update on scroll event via rAF', async () => {
    const badges: BadgeItem[] = [
      { id: 1, element: createMockElement() },
    ]
    el = createElement({ badges })
    await el.updateComplete

    const spy = vi.spyOn(el, 'requestUpdate')
    window.dispatchEvent(new Event('scroll'))

    await new Promise((r) => requestAnimationFrame(r))

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
