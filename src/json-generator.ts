import { Annotation } from './types'

interface JsonOutput {
  page: string
  timestamp: string
  annotations: ReadonlyArray<{
    id: number
    comment: string
    element: Annotation['element']
    source: Annotation['source']
    timestamp: string
  }>
}

export const generateJson = (
  annotations: readonly Annotation[],
  pageUrl: string,
): string => {
  const output: JsonOutput = {
    page: pageUrl,
    timestamp: new Date().toISOString(),
    annotations: annotations.map((a) => ({
      id: a.id,
      comment: a.comment,
      element: a.element,
      source: a.source,
      timestamp: a.timestamp,
    })),
  }

  return JSON.stringify(output, null, 2)
}
