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
      background: var(--yubisashi-bg, #fff);
      border: 1px solid var(--yubisashi-border, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--yubisashi-shadow, rgba(0, 0, 0, 0.12));
      font-size: 14px;
      user-select: none;
    }

    .toolbar.active {
      border-color: var(--yubisashi-primary, #6366f1);
      box-shadow: 0 4px 12px var(--yubisashi-shadow, rgba(99, 102, 241, 0.25));
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
      background: var(--yubisashi-hover, #f1f5f9);
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
      background: var(--yubisashi-primary-bg, #eef2ff);
    }

    .title {
      font-weight: 600;
      color: var(--yubisashi-text, #334155);
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
      background: var(--yubisashi-primary, #6366f1);
      color: var(--yubisashi-primary-text, #fff);
      border-radius: 11px;
      font-size: 12px;
      font-weight: 600;
    }

    .count.empty {
      background: var(--yubisashi-text-muted, #cbd5e1);
    }

    .separator {
      width: 1px;
      height: 20px;
      background: var(--yubisashi-border, #e2e8f0);
    }

    .format-toggle {
      font-size: 11px;
      font-weight: 600;
      color: var(--yubisashi-primary, #6366f1);
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--yubisashi-primary-bg, #eef2ff);
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      user-select: none;
    }

    .format-toggle:hover {
      background: var(--yubisashi-hover, #e0e7ff);
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

  @property()
  format: 'markdown' | 'json' = 'markdown'

  render() {
    return html`
      <div class="toolbar ${this.active ? 'active' : ''}"
        @mousemove=${this._stopPropagation}>
        <button
          class="toggle ${this.active ? 'active' : ''}"
          title="${this.active ? 'Disable annotation mode' : 'Enable annotation mode'}"
          aria-label="${this.active ? 'Disable annotation mode' : 'Enable annotation mode'}"
          aria-pressed="${this.active}"
          @click=${this._handleToggle}
        >
          ${this.active ? '\u{1F3AF}' : '\u{1F441}'}
        </button>

        <span class="title">yubisashi</span>

        <span class="count ${this.count === 0 ? 'empty' : ''}">${this.count}</span>

        <div class="separator"></div>

        <span
          class="format-toggle"
          title="Toggle output format (${this.format === 'markdown' ? 'Markdown' : 'JSON'})"
          @click=${this._handleFormatToggle}
        >${this.format === 'markdown' ? 'MD' : 'JSON'}</span>

        <button
          title="Copy annotations as ${this.format === 'markdown' ? 'Markdown' : 'JSON'}"
          aria-label="Copy annotations as ${this.format === 'markdown' ? 'Markdown' : 'JSON'}"
          ?disabled=${this.count === 0}
          @click=${this._handleCopy}
        >
          \u{1F4CB}
        </button>

        <button
          title="Show annotation list"
          aria-label="Show annotation list"
          ?disabled=${this.count === 0}
          @click=${this._handleList}
        >
          \u{1F4DD}
        </button>

        <button
          title="Clear all annotations"
          aria-label="Clear all annotations"
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

  private _handleFormatToggle() {
    const next = this.format === 'markdown' ? 'json' : 'markdown'
    this.dispatchEvent(
      new CustomEvent('format-change', {
        detail: { format: next },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _handleCopy() {
    this.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))
  }

  private _handleList() {
    this.dispatchEvent(new CustomEvent('list', { bubbles: true, composed: true }))
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
