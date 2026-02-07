const DATA_ATTR_PRIORITIES = [
  'data-testid',
  'data-controller',
  'data-action',
  'data-target',
] as const

const isUnique = (selector: string): boolean => {
  try {
    return document.querySelectorAll(selector).length === 1
  } catch {
    return false
  }
}

const escapeSelector = (value: string): string => {
  return CSS.escape(value)
}

const tryIdSelector = (element: HTMLElement): string | undefined => {
  if (!element.id) return undefined
  const selector = `#${escapeSelector(element.id)}`
  if (isUnique(selector)) return selector
  return undefined
}

const escapeAttrValue = (value: string): string => {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

const tryDataAttrSelector = (element: HTMLElement): string | undefined => {
  for (const attr of DATA_ATTR_PRIORITIES) {
    const value = element.getAttribute(attr)
    if (value) {
      const selector = `[${attr}="${escapeAttrValue(value)}"]`
      if (isUnique(selector)) return selector
    }
  }
  return undefined
}

const getTagWithClasses = (element: HTMLElement): string => {
  const tag = element.tagName.toLowerCase()
  if (element.classList.length === 0) return tag

  const classes = Array.from(element.classList)
    .filter((c) => !c.startsWith('js-') && c.length < 40)
    .slice(0, 3)
    .map((c) => `.${escapeSelector(c)}`)
    .join('')

  return tag + classes
}

const getNthChildIndex = (element: HTMLElement): number => {
  const parent = element.parentElement
  if (!parent) return 1

  const siblings = Array.from(parent.children)
  return siblings.indexOf(element) + 1
}

const buildPathSelector = (element: HTMLElement, maxDepth: number = 4): string => {
  const parts: string[] = []
  let current: HTMLElement | null = element

  for (let i = 0; i < maxDepth && current && current !== document.body; i++) {
    const tagClasses = getTagWithClasses(current)

    if (isUnique(tagClasses) && i > 0) {
      parts.unshift(tagClasses)
      break
    }

    parts.unshift(tagClasses)
    current = current.parentElement
  }

  const joined = parts.join(' > ')
  if (isUnique(joined)) return joined

  const partsWithNth = buildNthChildPath(element, maxDepth)
  return partsWithNth
}

const buildNthChildPath = (element: HTMLElement, maxDepth: number = 4): string => {
  const parts: string[] = []
  let current: HTMLElement | null = element

  for (let i = 0; i < maxDepth && current && current !== document.body; i++) {
    const tag = current.tagName.toLowerCase()
    const nth = getNthChildIndex(current)
    parts.unshift(`${tag}:nth-child(${nth})`)
    current = current.parentElement
  }

  return parts.join(' > ')
}

export const generateSelector = (element: HTMLElement): string => {
  const byId = tryIdSelector(element)
  if (byId) return byId

  const byData = tryDataAttrSelector(element)
  if (byData) return byData

  const byPath = buildPathSelector(element)
  return byPath
}
