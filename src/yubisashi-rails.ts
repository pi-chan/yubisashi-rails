import './toolbar'
import './popover'
import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { Annotation } from './types'
import { findTemplate, TemplateResult } from './comment-parser'
import { generateSelector } from './selector-generator'
import { generateMarkdown } from './markdown-generator'
import {
  isCombo,
  throttle,
  truncateText,
  collectDataAttributes,
  getBoundingBox,
} from './utils'

@customElement('yubisashi-rails')
export class YubisashiRails extends LitElement {
  static styles = css`
    :host {
      all: initial;
    }

    .overlay {
      position: absolute;
      z-index: 99999;
      background: rgba(99, 102, 241, 0.15);
      border: 2px solid rgba(99, 102, 241, 0.6);
      border-radius: 2px;
      pointer-events: none;
    }

    .overlay-label {
      position: sticky;
      top: 0;
      width: fit-content;
      padding: 2px 8px;
      background: #6366f1;
      color: #fff;
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      pointer-events: none;
      white-space: nowrap;
      border-radius: 0 0 4px 0;
    }

    [hidden] {
      display: none !important;
    }
  `

  @property()
  root = '/'

  @property({ attribute: 'combo-key' })
  comboKey = 'command-shift-a'

  @property()
  position: 'bottom-right' | 'bottom-left' = 'bottom-right'

  @property()
  format: 'markdown' | 'json' = 'markdown'

  @state()
  private _active = false

  @state()
  private _annotations: Annotation[] = []

  @state()
  private _hoverResult: TemplateResult | null = null

  @state()
  private _overlayVisible = false

  @state()
  private _popoverVisible = false

  @state()
  private _popoverX = 0

  @state()
  private _popoverY = 0

  @state()
  private _pendingElement: HTMLElement | null = null

  @state()
  private _pendingTemplate: TemplateResult | null = null

  private _nextId = 1
  private _throttledMouseMove: (event: MouseEvent) => void

  constructor() {
    super()
    this._throttledMouseMove = throttle(this._handleMouseMove, 80)
  }

  render() {
    return html`
      <div
        class="overlay"
        ?hidden=${!this._overlayVisible || !this._hoverResult}
        style=${styleMap(this._overlayStyle())}
      >
        <div class="overlay-label">
          ${this._hoverResult?.path}
        </div>
      </div>

      ${this._popoverVisible
        ? html`
            <yubisashi-popover
              .x=${this._popoverX}
              .y=${this._popoverY}
              .filePath=${this._pendingTemplate?.path ?? ''}
              @submit=${this._handlePopoverSubmit}
              @cancel=${this._handlePopoverCancel}
            ></yubisashi-popover>
          `
        : null}

      <yubisashi-toolbar
        .active=${this._active}
        .count=${this._annotations.length}
        .position=${this.position}
        @toggle=${this._handleToggle}
        @copy=${this._handleCopy}
        @clear=${this._handleClear}
      ></yubisashi-toolbar>
    `
  }

  connectedCallback() {
    super.connectedCallback()
    document.body.addEventListener('keydown', this._handleKeyDown)
    console.info(
      `[yubisashi-rails] Ready. Press ${this.comboKey.replace('command', 'Cmd').replace('shift', 'Shift').replace('-', '+')} to toggle.`,
    )
  }

  disconnectedCallback() {
    this._deactivate()
    document.body.removeEventListener('keydown', this._handleKeyDown)
    super.disconnectedCallback()
  }

  private _activate() {
    this._active = true
    document.body.addEventListener('mousemove', this._throttledMouseMove)
    document.body.addEventListener('click', this._handleClick, true)
  }

  private _deactivate() {
    this._active = false
    this._overlayVisible = false
    this._popoverVisible = false
    document.body.removeEventListener('mousemove', this._throttledMouseMove)
    document.body.removeEventListener('click', this._handleClick, true)
  }

  private _toggle() {
    this._active ? this._deactivate() : this._activate()
  }

  private _overlayStyle() {
    if (!this._hoverResult) return {}
    const rect = this._hoverResult.element.getBoundingClientRect()
    return {
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.top + window.scrollY}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this._popoverVisible) {
        this._popoverVisible = false
        return
      }
      if (this._active) {
        this._deactivate()
      }
      return
    }
    if (isCombo(this.comboKey, event)) {
      event.preventDefault()
      this._toggle()
    }
  }

  private _isOwnElement(event: Event): boolean {
    return event.composedPath().includes(this)
  }

  private _handleMouseMove = (event: MouseEvent) => {
    if (this._popoverVisible) return

    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (this._isOwnElement(event)) return

    const result = findTemplate(target, this.root)
    this._hoverResult = result ?? null
    this._overlayVisible = !!result
  }

  private _handleClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (this._isOwnElement(event)) return

    if (this._popoverVisible) {
      this._popoverVisible = false
      return
    }

    const result = findTemplate(target, this.root)
    if (!result) return

    event.preventDefault()
    event.stopPropagation()

    this._pendingElement = target
    this._pendingTemplate = result
    this._popoverX = event.clientX
    this._popoverY = event.clientY
    this._popoverVisible = true
    this._overlayVisible = false
  }

  private _handlePopoverSubmit = (event: CustomEvent<{ comment: string }>) => {
    const { comment } = event.detail
    if (!this._pendingElement || !this._pendingTemplate) return

    const element = this._pendingElement
    const template = this._pendingTemplate

    const annotation: Annotation = {
      id: this._nextId++,
      comment: comment || `Annotation #${this._nextId - 1}`,
      element: {
        tagName: element.tagName.toLowerCase(),
        selector: generateSelector(element),
        classes: Array.from(element.classList),
        text: truncateText(element.textContent ?? '', 100),
        boundingBox: getBoundingBox(element),
        dataAttributes: collectDataAttributes(element),
      },
      source: {
        file: template.path,
        absolutePath: template.absolutePath,
      },
      timestamp: new Date().toISOString(),
    }

    this._annotations = [...this._annotations, annotation]
    this._popoverVisible = false
    this._pendingElement = null
    this._pendingTemplate = null
  }

  private _handlePopoverCancel = () => {
    this._popoverVisible = false
    this._pendingElement = null
    this._pendingTemplate = null
  }

  private _handleToggle = () => {
    this._toggle()
  }

  private _handleCopy = async () => {
    const md = generateMarkdown(this._annotations, window.location.href)
    try {
      await navigator.clipboard.writeText(md)
      console.info('[yubisashi-rails] Markdown copied to clipboard.')
    } catch (err) {
      console.error('[yubisashi-rails] Failed to copy:', err)
    }
  }

  private _handleClear = () => {
    this._annotations = []
    this._nextId = 1
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yubisashi-rails': YubisashiRails
  }
}
