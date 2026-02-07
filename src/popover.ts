import { html, css, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('yubisashi-popover')
export class YubisashiPopover extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      z-index: 100001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .popover {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
      padding: 12px;
      width: 320px;
    }

    .header {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .file-path {
      font-size: 11px;
      color: #6366f1;
      font-family: 'SF Mono', 'Fira Code', monospace;
      margin-bottom: 8px;
      word-break: break-all;
    }

    textarea {
      width: 100%;
      min-height: 60px;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
    }

    textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      margin-top: 8px;
    }

    button {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
    }

    .btn-submit {
      background: #6366f1;
      color: #fff;
    }

    .btn-submit:hover {
      background: #4f46e5;
    }

    [hidden] {
      display: none !important;
    }
  `

  @property({ type: Number })
  x = 0

  @property({ type: Number })
  y = 0

  @property()
  filePath = ''

  @query('textarea')
  private _textarea!: HTMLTextAreaElement

  render() {
    return html`
      <div class="popover"
        style="margin-top: 4px"
        @click=${this._stopPropagation}
        @mousemove=${this._stopPropagation}>
        <div class="header">Add annotation</div>
        <div class="file-path">${this.filePath}</div>
        <textarea
          placeholder="What should be changed?"
          @keydown=${this._handleKeydown}
        ></textarea>
        <div class="actions">
          <button class="btn-cancel" @click=${this._handleCancel}>Cancel</button>
          <button class="btn-submit" @click=${this._handleSubmit}>Add</button>
        </div>
      </div>
    `
  }

  firstUpdated() {
    requestAnimationFrame(() => {
      this._textarea?.focus()
      this._adjustPosition()
    })
  }

  private _adjustPosition() {
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const popoverW = 320 + 24
    const popoverH = 200

    let left = this.x
    let top = this.y

    if (left + popoverW > viewportW) {
      left = viewportW - popoverW
    }
    if (top + popoverH > viewportH) {
      top = this.y - popoverH
    }

    this.style.left = `${Math.max(8, left)}px`
    this.style.top = `${Math.max(8, top)}px`
  }

  private _stopPropagation(event: Event) {
    event.stopPropagation()
  }

  private _handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      this._submit()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      this._cancel()
    }
    event.stopPropagation()
  }

  private _handleSubmit() {
    this._submit()
  }

  private _handleCancel() {
    this._cancel()
  }

  private _submit() {
    const comment = this._textarea?.value.trim() ?? ''
    this.dispatchEvent(
      new CustomEvent('submit', {
        detail: { comment },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _cancel() {
    this.dispatchEvent(
      new CustomEvent('cancel', { bubbles: true, composed: true }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yubisashi-popover': YubisashiPopover
  }
}
