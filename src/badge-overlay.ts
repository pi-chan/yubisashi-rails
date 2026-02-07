import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'

export interface BadgePosition {
  left: number
  top: number
}

export const calcBadgePosition = (
  rect: { x: number; y: number; width: number; height: number },
  scrollX: number,
  scrollY: number,
): BadgePosition => ({
  left: rect.x + scrollX,
  top: rect.y + scrollY,
})

export interface BadgeItem {
  id: number
  element: HTMLElement
}

@customElement('yubisashi-badge-overlay')
export class YubisashiBadgeOverlay extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 99998;
    }

    .badge {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--yubisashi-primary, #6366f1);
      color: var(--yubisashi-primary-text, #fff);
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 2px 6px var(--yubisashi-shadow, rgba(99, 102, 241, 0.4));
      pointer-events: auto;
      cursor: pointer;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease;
      user-select: none;
    }

    .badge:hover {
      transform: translate(-50%, -50%) scale(1.2);
    }
  `

  @property({ type: Array })
  badges: BadgeItem[] = []

  private _scrollRaf = 0

  render() {
    const positions = this.badges.map((badge) => {
      const rect = badge.element.getBoundingClientRect()
      const pos = calcBadgePosition(rect, window.scrollX, window.scrollY)
      return { ...badge, ...pos }
    })

    return html`
      ${positions.map(
        (p) => html`
          <div
            class="badge"
            style=${styleMap({
              left: `${p.left}px`,
              top: `${p.top}px`,
            })}
            title="Annotation #${p.id}"
            @click=${() => this._handleBadgeClick(p.id)}
          >
            ${p.id}
          </div>
        `,
      )}
    `
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('resize', this._handleResize)
    window.addEventListener('scroll', this._handleScroll)
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._handleResize)
    window.removeEventListener('scroll', this._handleScroll)
    if (this._scrollRaf) cancelAnimationFrame(this._scrollRaf)
    super.disconnectedCallback()
  }

  private _handleResize = () => {
    this.requestUpdate()
  }

  private _handleScroll = () => {
    if (this._scrollRaf) return
    this._scrollRaf = requestAnimationFrame(() => {
      this.requestUpdate()
      this._scrollRaf = 0
    })
  }

  private _handleBadgeClick(id: number) {
    this.dispatchEvent(
      new CustomEvent('badge-click', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yubisashi-badge-overlay': YubisashiBadgeOverlay
  }
}
