import { LitElement } from 'lit';
export declare class YubisashiToolbar extends LitElement {
    static styles: import("lit").CSSResult;
    active: boolean;
    count: number;
    position: 'bottom-right' | 'bottom-left';
    render(): import("lit").TemplateResult<1>;
    private _stopPropagation;
    private _handleToggle;
    private _handleCopy;
    private _handleClear;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-toolbar': YubisashiToolbar;
    }
}
