export declare const isCombo: (comboKey: string, event: KeyboardEvent) => boolean;
export declare const throttle: <T extends (...args: never[]) => void>(fn: T, ms: number) => ((...args: Parameters<T>) => void);
export declare const truncateText: (text: string, maxLength: number) => string;
export declare const collectDataAttributes: (element: HTMLElement) => Record<string, string>;
export declare const getBoundingBox: (element: HTMLElement) => {
    x: number;
    y: number;
    width: number;
    height: number;
};
