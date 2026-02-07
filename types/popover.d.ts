import { LitElement } from 'lit';
export declare class YubisashiPopover extends LitElement {
    static styles: import("lit").CSSResult;
    x: number;
    y: number;
    filePath: string;
    private _textarea;
    render(): import("lit").TemplateResult<1>;
    firstUpdated(): void;
    private _adjustPosition;
    private _stopPropagation;
    private _handleKeydown;
    private _handleSubmit;
    private _handleCancel;
    private _submit;
    private _cancel;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-popover': YubisashiPopover;
    }
}
