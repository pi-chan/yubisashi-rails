import { html, css, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { Annotation } from './types'

export interface AnnotationSummary {
  id: number
  comment: string
  file: string
  shortFile: string
  selector: string
  tagName: string
  text: string
  selectedText?: string
}

const extractShortFile = (filePath: string): string => {
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

export const formatAnnotationSummary = (annotation: Annotation): AnnotationSummary => {
  const comment = annotation.comment.length > 80
    ? annotation.comment.slice(0, 80) + '...'
    : annotation.comment

  return {
    id: annotation.id,
    comment,
    file: annotation.source.file,
    shortFile: extractShortFile(annotation.source.file),
    selector: annotation.element.selector,
    tagName: annotation.element.tagName,
    text: annotation.element.text,
    selectedText: annotation.element.selectedText,
  }
}

@customElement('yubisashi-annotation-panel')
export class YubisashiAnnotationPanel extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 100002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .panel {
      width: 360px;
      height: 100%;
      background: var(--yubisashi-bg, #fff);
      border-left: 1px solid var(--yubisashi-border, #e2e8f0);
      box-shadow: -4px 0 16px var(--yubisashi-shadow, rgba(0, 0, 0, 0.08));
      display: flex;
      flex-direction: column;
      transform: translateX(0);
      transition: transform 0.2s ease;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--yubisashi-border, #e2e8f0);
      flex-shrink: 0;
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--yubisashi-text, #334155);
    }

    .panel-count {
      font-size: 12px;
      color: var(--yubisashi-text-muted, #94a3b8);
      margin-left: 8px;
    }

    .close-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      font-size: 16px;
      color: var(--yubisashi-muted, #64748b);
      transition: background 0.15s;
    }

    .close-btn:hover {
      background: var(--yubisashi-hover, #f1f5f9);
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      color: var(--yubisashi-text-muted, #94a3b8);
      font-size: 13px;
    }

    .annotation-card {
      padding: 10px 12px;
      border: 1px solid var(--yubisashi-border, #e2e8f0);
      border-radius: 8px;
      margin-bottom: 6px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .annotation-card:hover {
      border-color: var(--yubisashi-primary, #6366f1);
      box-shadow: 0 0 0 1px var(--yubisashi-primary-bg, rgba(99, 102, 241, 0.15));
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .card-id {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      background: var(--yubisashi-primary, #6366f1);
      color: var(--yubisashi-primary-text, #fff);
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
    }

    .card-actions {
      display: flex;
      gap: 4px;
    }

    .card-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      font-size: 12px;
      color: var(--yubisashi-text-muted, #94a3b8);
      transition: background 0.15s, color 0.15s;
    }

    .card-btn:hover {
      background: var(--yubisashi-hover, #f1f5f9);
      color: var(--yubisashi-text, #475569);
    }

    .card-btn.delete:hover {
      background: var(--yubisashi-danger-bg, #fef2f2);
      color: var(--yubisashi-danger, #ef4444);
    }

    .card-comment {
      font-size: 13px;
      color: var(--yubisashi-text, #334155);
      margin: 4px 0;
      line-height: 1.4;
    }

    .card-comment-input {
      width: 100%;
      padding: 4px 6px;
      border: 1px solid var(--yubisashi-primary, #6366f1);
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      background: var(--yubisashi-bg, #fff);
      color: var(--yubisashi-text, #334155);
    }

    .card-file {
      font-size: 11px;
      color: var(--yubisashi-primary, #6366f1);
      font-family: 'SF Mono', 'Fira Code', monospace;
      word-break: break-all;
    }

    .card-selector {
      font-size: 10px;
      color: var(--yubisashi-text-muted, #94a3b8);
      font-family: 'SF Mono', 'Fira Code', monospace;
      margin-top: 2px;
      word-break: break-all;
    }

    .card-selected-text {
      font-size: 11px;
      color: var(--yubisashi-text, #475569);
      background: var(--yubisashi-bg-secondary, #f8fafc);
      border-radius: 4px;
      padding: 4px 6px;
      margin-top: 4px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    [hidden] {
      display: none !important;
    }
  `

  @property({ type: Array })
  annotations: Annotation[] = []

  @state()
  private _editingId: number | null = null

  @state()
  private _editingComment = ''

  render() {
    const summaries = this.annotations.map(formatAnnotationSummary)

    return html`
      <div class="panel">
        <div class="panel-header">
          <div>
            <span class="panel-title">Annotations</span>
            <span class="panel-count">(${this.annotations.length})</span>
          </div>
          <button class="close-btn" @click=${this._handleClose} title="Close panel" aria-label="Close panel">
            \u2715
          </button>
        </div>
        <div class="panel-body">
          ${summaries.length === 0
            ? html`<div class="empty-state">No annotations yet</div>`
            : summaries.map((s) => this._renderCard(s))}
        </div>
      </div>
    `
  }

  private _renderCard(summary: AnnotationSummary) {
    const isEditing = this._editingId === summary.id

    return html`
      <div class="annotation-card" @click=${() => this._handleCardClick(summary.id)}>
        <div class="card-header">
          <span class="card-id">${summary.id}</span>
          <div class="card-actions">
            <button
              class="card-btn"
              title="Edit"
              aria-label="Edit annotation"
              @click=${(e: Event) => { e.stopPropagation(); this._startEdit(summary.id, summary.comment) }}
            >
              \u270E
            </button>
            <button
              class="card-btn delete"
              title="Delete"
              aria-label="Delete annotation"
              @click=${(e: Event) => { e.stopPropagation(); this._handleDelete(summary.id) }}
            >
              \u2715
            </button>
          </div>
        </div>
        ${isEditing
          ? html`
            <input
              class="card-comment-input"
              .value=${this._editingComment}
              @input=${this._handleEditInput}
              @keydown=${this._handleEditKeydown}
              @click=${(e: Event) => e.stopPropagation()}
            />
          `
          : html`<div class="card-comment">${summary.comment}</div>`}
        <div class="card-file">${summary.file}</div>
        <div class="card-selector">${summary.selector}</div>
        ${summary.selectedText
          ? html`<div class="card-selected-text">${summary.selectedText}</div>`
          : nothing}
      </div>
    `
  }

  private _handleClose() {
    this.dispatchEvent(
      new CustomEvent('panel-close', { bubbles: true, composed: true }),
    )
  }

  private _handleCardClick(id: number) {
    this.dispatchEvent(
      new CustomEvent('annotation-select', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _handleDelete(id: number) {
    this.dispatchEvent(
      new CustomEvent('annotation-delete', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _startEdit(id: number, currentComment: string) {
    this._editingId = id
    this._editingComment = currentComment
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.card-comment-input') as HTMLInputElement | null
      input?.focus()
    })
  }

  private _handleEditInput(e: Event) {
    this._editingComment = (e.target as HTMLInputElement).value
  }

  private _handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this._commitEdit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      this._cancelEdit()
    }
    e.stopPropagation()
  }

  private _commitEdit() {
    if (this._editingId === null) return
    const trimmed = this._editingComment.trim()
    if (trimmed.length === 0) return
    this.dispatchEvent(
      new CustomEvent('annotation-edit', {
        detail: { id: this._editingId, comment: trimmed },
        bubbles: true,
        composed: true,
      }),
    )
    this._editingId = null
    this._editingComment = ''
  }

  private _cancelEdit() {
    this._editingId = null
    this._editingComment = ''
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yubisashi-annotation-panel': YubisashiAnnotationPanel
  }
}
