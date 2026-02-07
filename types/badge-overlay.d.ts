import { LitElement } from 'lit';
export interface BadgePosition {
    left: number;
    top: number;
}
export declare const calcBadgePosition: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
}, scrollX: number, scrollY: number) => BadgePosition;
export interface BadgeItem {
    id: number;
    element: HTMLElement;
}
export declare class YubisashiBadgeOverlay extends LitElement {
    static styles: import("lit").CSSResult;
    badges: BadgeItem[];
    private _scrollRaf;
    render(): import("lit").TemplateResult<1>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _handleResize;
    private _handleScroll;
    private _handleBadgeClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-badge-overlay': YubisashiBadgeOverlay;
    }
}
