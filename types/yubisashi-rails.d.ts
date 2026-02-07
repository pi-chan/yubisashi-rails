import './toolbar';
import './popover';
import './badge-overlay';
import './annotation-panel';
import { LitElement } from 'lit';
import { type ThemeMode } from './theme';
export declare class YubisashiRails extends LitElement {
    static styles: import("lit").CSSResult;
    root: string;
    comboKey: string;
    position: 'bottom-right' | 'bottom-left';
    format: 'markdown' | 'json';
    theme: ThemeMode;
    private _active;
    private _annotations;
    private _hoverResult;
    private _overlayVisible;
    private _popoverVisible;
    private _popoverX;
    private _popoverY;
    private _pendingElement;
    private _pendingTemplate;
    private _pendingSelectedText;
    private _badgeItems;
    private _panelVisible;
    private _nextId;
    private _throttledMouseMove;
    private _darkModeQuery;
    constructor();
    render(): import("lit").TemplateResult<1>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string, unknown>): void;
    private _applyTheme;
    private _handleDarkModeChange;
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
    private _handleFormatChange;
    private _handleCopy;
    private _handleListToggle;
    private _handlePanelClose;
    private _handleAnnotationSelect;
    private _handleAnnotationDelete;
    private _handleAnnotationEdit;
    private _handleBadgeClick;
    private _handleClear;
}
declare global {
    interface HTMLElementTagNameMap {
        'yubisashi-rails': YubisashiRails;
    }
}
