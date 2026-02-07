export interface TemplateResult {
  element: HTMLElement
  path: string
  absolutePath: string
}

const COMMENT_PATTERN = /^(BEGIN|END) (\S+)$/

const findPreviousAnnotateComment = (
  startNode: ChildNode,
): string | undefined => {
  const ignorePaths: string[] = []
  let current = startNode.previousSibling

  while (current) {
    if (current.nodeName === '#comment') {
      const comment = (current as Comment).data.trim()
      const match = comment.match(COMMENT_PATTERN)
      if (match) {
        const [, prefix, path] = match
        if (prefix === 'END') {
          ignorePaths.push(path)
        } else if (!ignorePaths.includes(path)) {
          return path
        }
      }
    }
    current = current.previousSibling
  }

  return undefined
}

const findTemplateForElement = (
  startElement: HTMLElement,
): TemplateResult | undefined => {
  let current: HTMLElement | null = startElement

  while (current) {
    const path = findPreviousAnnotateComment(current)
    if (path) {
      return { element: current, path, absolutePath: path }
    }
    current = current.parentElement
  }

  return undefined
}

const toRelativePath = (absolutePath: string, root: string): string => {
  const normalizedRoot = root.endsWith('/') ? root : root + '/'
  if (absolutePath.startsWith(normalizedRoot)) {
    return absolutePath.slice(normalizedRoot.length)
  }
  return absolutePath
}

export const findTemplate = (
  element: HTMLElement,
  root: string,
): TemplateResult | undefined => {
  const result = findTemplateForElement(element)
  if (!result) return undefined

  return {
    element: result.element,
    absolutePath: result.path,
    path: toRelativePath(result.path, root),
  }
}
