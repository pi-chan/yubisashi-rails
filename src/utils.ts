const isKeyActive = (key: string, event: KeyboardEvent): boolean => {
  switch (key) {
    case 'shift':
    case 'control':
    case 'alt':
    case 'meta':
      return event.getModifierState(key.charAt(0).toUpperCase() + key.slice(1))
    default:
      return key === event.key.toLowerCase()
  }
}

export const isCombo = (comboKey: string, event: KeyboardEvent): boolean => {
  const keys = comboKey.replace('command', 'meta').toLowerCase().split('-')
  return keys.every((key) => isKeyActive(key, event))
}

export const throttle = <T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= ms) {
      lastTime = now
      fn(...args)
    }
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.slice(0, maxLength) + '...'
}

export const collectDataAttributes = (element: HTMLElement): Record<string, string> => {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-')) {
      attrs[attr.name] = attr.value
    }
  }
  return attrs
}

export const getBoundingBox = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}
