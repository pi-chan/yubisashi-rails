import './toolbar';
import './popover';
import { LitElement } from 'lit';
export declare class YubisashiRails extends LitElement {
    static styles: import("lit").CSSResult;
    root: string;
    comboKey: string;
    position: 'bottom-right' | 'bottom-left';
    format: 'markdown' | 'json';
    private _active;
    private _annotations;
    private _hoverResult;
    private _overlayVisible;
    private _popoverVisible;
    private _popoverX;
    private _popoverY;
    private _pendingElement;
    private _pendingTemplate;
    private _nextId;
    private _throttledMouseMove;
    constructor();
    render(): import("lit").TemplateResult<1>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _activate;
    private _deactivate;
    private _toggle;
    private _overlayStyle;
    private _handleKeyDown;
    private _isOwnElement;
    private _handleMouseMove;
    private _handleClick;
    private _handlePopoverSubmit;
    private _handlePopoverCancel;
    private _handleToggle;
    private _handleCopy;
    private _handleClear;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-rails': YubisashiRails;
    }
}
