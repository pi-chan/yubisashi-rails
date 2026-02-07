import { describe, it, expect, beforeEach } from 'vitest'
import { generateSelector } from '../selector-generator'

describe('generateSelector', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    document.body.replaceChildren()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('ID selector', () => {
    it('returns ID selector when element has a unique id', () => {
      const el = document.createElement('div')
      el.id = 'main-content'
      container.appendChild(el)

      expect(generateSelector(el)).toBe('#main-content')
    })

    it('escapes special characters in id', () => {
      const el = document.createElement('div')
      el.id = 'foo:bar'
      container.appendChild(el)

      const selector = generateSelector(el)
      expect(selector).toContain('#')
      expect(document.querySelectorAll(selector).length).toBe(1)
    })
  })

  describe('data attribute selector', () => {
    it('returns data-testid selector', () => {
      const el = document.createElement('div')
      el.setAttribute('data-testid', 'user-profile')
      container.appendChild(el)

      expect(generateSelector(el)).toBe('[data-testid="user-profile"]')
    })

    it('returns data-controller selector', () => {
      const el = document.createElement('div')
      el.setAttribute('data-controller', 'modal')
      container.appendChild(el)

      expect(generateSelector(el)).toBe('[data-controller="modal"]')
    })

    it('prefers data-testid over data-controller', () => {
      const el = document.createElement('div')
      el.setAttribute('data-testid', 'user-modal')
      el.setAttribute('data-controller', 'modal')
      container.appendChild(el)

      expect(generateSelector(el)).toBe('[data-testid="user-modal"]')
    })

    it('returns data-action selector when higher priority attrs absent', () => {
      const el = document.createElement('div')
      el.setAttribute('data-action', 'click->modal#open')
      container.appendChild(el)

      expect(generateSelector(el)).toBe('[data-action="click-\\>modal\\#open"]')
    })
  })

  describe('path-based selector', () => {
    it('uses tag + class combination', () => {
      const el = document.createElement('div')
      el.classList.add('user-card')
      container.appendChild(el)

      const selector = generateSelector(el)
      expect(selector).toBeTruthy()
      expect(document.querySelectorAll(selector).length).toBeGreaterThanOrEqual(1)
    })

    it('filters out js- prefixed classes', () => {
      const el = document.createElement('div')
      el.classList.add('js-hook')
      el.classList.add('user-card')
      container.appendChild(el)

      const selector = generateSelector(el)
      expect(selector).not.toContain('js-hook')
    })

    it('limits classes to 3', () => {
      const el = document.createElement('div')
      el.classList.add('a', 'b', 'c', 'd', 'e')
      container.appendChild(el)

      const selector = generateSelector(el)
      const classCount = (selector.match(/\./g) || []).length
      expect(classCount).toBeLessThanOrEqual(3)
    })

    it('filters out classes longer than 40 characters', () => {
      const longClass = 'a'.repeat(41)
      const el = document.createElement('div')
      el.classList.add(longClass)
      el.classList.add('short')
      container.appendChild(el)

      const selector = generateSelector(el)
      expect(selector).not.toContain(longClass)
    })
  })

  describe('nth-child fallback', () => {
    it('uses nth-child when no other selector is unique', () => {
      const items = Array.from({ length: 3 }, () => {
        const el = document.createElement('div')
        el.classList.add('item')
        container.appendChild(el)
        return el
      })

      const selector = generateSelector(items[1])
      expect(selector).toContain('nth-child')
    })
  })
})
