import { Annotation } from './types'

const formatAnnotation = (annotation: Annotation): string => {
  const lines: string[] = []
  const { element, source } = annotation

  lines.push(`## #${annotation.id} ${annotation.comment}`)
  lines.push('')
  lines.push(`- **File**: \`${source.file}\``)
  lines.push(`- **Selector**: \`${element.selector}\``)

  if (element.classes.length > 0) {
    lines.push(`- **Classes**: \`${element.classes.join(' ')}\``)
  }

  if (element.text) {
    lines.push(`- **Text**: "${element.text}"`)
  }

  if (element.selectedText) {
    lines.push(`- **Selected text**: "${element.selectedText}"`)
  }

  if (Object.keys(element.dataAttributes).length > 0) {
    const attrs = Object.entries(element.dataAttributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(', ')
    lines.push(`- **Data attributes**: ${attrs}`)
  }

  const { boundingBox: bb } = element
  lines.push(`- **Bounding box**: x=${bb.x}, y=${bb.y}, w=${bb.width}, h=${bb.height}`)

  return lines.join('\n')
}

export const generateMarkdown = (
  annotations: readonly Annotation[],
  pageUrl: string,
): string => {
  if (annotations.length === 0) return ''

  const lines: string[] = []

  lines.push('# UI Annotations')
  lines.push('')
  lines.push(`> Page: ${pageUrl}`)
  lines.push(`> Timestamp: ${new Date().toISOString()}`)

  for (const annotation of annotations) {
    lines.push('')
    lines.push(formatAnnotation(annotation))
  }

  lines.push('')
  return lines.join('\n')
}
