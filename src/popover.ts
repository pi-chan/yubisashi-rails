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
      background: var(--yubisashi-bg, #fff);
      border: 1px solid var(--yubisashi-border, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 8px 24px var(--yubisashi-shadow, rgba(0, 0, 0, 0.16));
      padding: 12px;
      width: 320px;
    }

    .header {
      font-size: 12px;
      color: var(--yubisashi-muted, #64748b);
      margin-bottom: 8px;
    }

    .file-path {
      font-size: 11px;
      color: var(--yubisashi-primary, #6366f1);
      font-family: 'SF Mono', 'Fira Code', monospace;
      margin-bottom: 8px;
      word-break: break-all;
    }

    textarea {
      width: 100%;
      min-height: 60px;
      padding: 8px;
      border: 1px solid var(--yubisashi-border, #e2e8f0);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
      background: var(--yubisashi-bg, #fff);
      color: var(--yubisashi-text, #334155);
    }

    textarea:focus {
      border-color: var(--yubisashi-primary, #6366f1);
      box-shadow: 0 0 0 2px var(--yubisashi-primary-bg, rgba(99, 102, 241, 0.15));
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
      background: var(--yubisashi-hover, #f1f5f9);
      color: var(--yubisashi-text, #475569);
    }

    .btn-cancel:hover {
      background: var(--yubisashi-border, #e2e8f0);
    }

    .btn-submit {
      background: var(--yubisashi-primary, #6366f1);
      color: var(--yubisashi-primary-text, #fff);
    }

    .btn-submit:hover {
      background: var(--yubisashi-primary-hover, #4f46e5);
    }

    .selected-text {
      font-size: 11px;
      color: var(--yubisashi-text, #475569);
      background: var(--yubisashi-bg-secondary, #f8fafc);
      border: 1px solid var(--yubisashi-border, #e2e8f0);
      border-radius: 6px;
      padding: 6px 8px;
      margin-bottom: 8px;
      max-height: 60px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .selected-text-label {
      font-size: 10px;
      color: var(--yubisashi-text-muted, #94a3b8);
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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

  @property()
  selectedText = ''

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
        ${this.selectedText
          ? html`
            <div class="selected-text-label">Selected text</div>
            <div class="selected-text">${this.selectedText}</div>
          `
          : null}
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
