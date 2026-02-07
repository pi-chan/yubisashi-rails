export interface AnnotationElement {
  tagName: string
  selector: string
  classes: string[]
  text: string
  selectedText?: string
  boundingBox: { x: number; y: number; width: number; height: number }
  dataAttributes: Record<string, string>
}

export interface AnnotationSource {
  file: string
  absolutePath: string
}

export interface Annotation {
  id: number
  comment: string
  element: AnnotationElement
  source: AnnotationSource
  timestamp: string
}
