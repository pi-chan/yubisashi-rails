import { LitElement } from 'lit';
import type { Annotation } from './types';
export interface AnnotationSummary {
    id: number;
    comment: string;
    file: string;
    shortFile: string;
    selector: string;
    tagName: string;
    text: string;
    selectedText?: string;
}
export declare const formatAnnotationSummary: (annotation: Annotation) => AnnotationSummary;
export declare class YubisashiAnnotationPanel extends LitElement {
    static styles: import("lit").CSSResult;
    annotations: Annotation[];
    private _editingId;
    private _editingComment;
    render(): import("lit").TemplateResult<1>;
    private _renderCard;
    private _handleClose;
    private _handleCardClick;
    private _handleDelete;
    private _startEdit;
    private _handleEditInput;
    private _handleEditKeydown;
    private _commitEdit;
    private _cancelEdit;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-annotation-panel': YubisashiAnnotationPanel;
    }
}
