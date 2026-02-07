import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('yubisashi-toolbar')
export class YubisashiToolbar extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      z-index: 100000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    :host([position="bottom-right"]) {
      bottom: 16px;
      right: 16px;
    }

    :host([position="bottom-left"]) {
      bottom: 16px;
      left: 16px;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      font-size: 14px;
      user-select: none;
    }

    .toolbar.active {
      border-color: #6366f1;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    button {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      transition: background 0.15s;
    }

    button:hover:not([disabled]) {
      background: #f1f5f9;
    }

    button[disabled] {
      pointer-events: none;
      opacity: 0.4;
      cursor: default;
    }

    button.toggle {
      font-size: 18px;
    }

    button.toggle.active {
      background: #eef2ff;
    }

    .title {
      font-weight: 600;
      color: #334155;
      font-size: 13px;
      letter-spacing: -0.01em;
    }

    .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      background: #6366f1;
      color: #fff;
      border-radius: 11px;
      font-size: 12px;
      font-weight: 600;
    }

    .count.empty {
      background: #cbd5e1;
    }

    .separator {
      width: 1px;
      height: 20px;
      background: #e2e8f0;
    }

    [hidden] {
      display: none !important;
    }
  `

  @property({ type: Boolean })
  active = false

  @property({ type: Number })
  count = 0

  @property({ reflect: true })
  position: 'bottom-right' | 'bottom-left' = 'bottom-right'

  render() {
    return html`
      <div class="toolbar ${this.active ? 'active' : ''}"
        @mousemove=${this._stopPropagation}>
        <button
          class="toggle ${this.active ? 'active' : ''}"
          title="${this.active ? 'Disable annotation mode' : 'Enable annotation mode'}"
          @click=${this._handleToggle}
        >
          ${this.active ? '\u{1F3AF}' : '\u{1F3AF}'}
        </button>

        <span class="title">yubisashi</span>

        <span class="count ${this.count === 0 ? 'empty' : ''}">${this.count}</span>

        <div class="separator"></div>

        <button
          title="Copy annotations as Markdown"
          ?disabled=${this.count === 0}
          @click=${this._handleCopy}
        >
          \u{1F4CB}
        </button>

        <button
          title="Clear all annotations"
          ?disabled=${this.count === 0}
          @click=${this._handleClear}
        >
          \u{1F5D1}
        </button>
      </div>
    `
  }

  private _stopPropagation(event: Event) {
    event.stopPropagation()
  }

  private _handleToggle() {
    this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }))
  }

  private _handleCopy() {
    this.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))
  }

  private _handleClear() {
    this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yubisashi-toolbar': YubisashiToolbar
  }
}
