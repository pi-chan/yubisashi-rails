import { describe, it, expect } from 'vitest'
import { getSelectedText } from '../utils'

describe('getSelectedText', () => {
  it('returns undefined when no text is selected', () => {
    expect(getSelectedText()).toBeUndefined()
  })

  it('returns undefined for empty selection', () => {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    expect(getSelectedText()).toBeUndefined()
  })
})
