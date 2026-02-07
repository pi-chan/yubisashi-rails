export interface TemplateResult {
    element: HTMLElement;
    path: string;
    absolutePath: string;
}
export declare const findTemplate: (element: HTMLElement, root: string) => TemplateResult | undefined;
