import { describe, it, expect } from 'vitest'
import { calcBadgePosition } from '../badge-overlay'

describe('calcBadgePosition', () => {
  it('positions badge at top-left of element', () => {
    const rect = { x: 100, y: 200, width: 300, height: 150 }
    const pos = calcBadgePosition(rect, 0, 0)

    expect(pos.left).toBe(100)
    expect(pos.top).toBe(200)
  })

  it('accounts for scroll offset', () => {
    const rect = { x: 50, y: 80, width: 200, height: 100 }
    const pos = calcBadgePosition(rect, 100, 50)

    expect(pos.left).toBe(150)
    expect(pos.top).toBe(130)
  })

  it('offsets badge to not overlap element edge', () => {
    const rect = { x: 0, y: 0, width: 100, height: 50 }
    const pos = calcBadgePosition(rect, 0, 0)

    expect(pos.left).toBe(0)
    expect(pos.top).toBe(0)
  })
})
