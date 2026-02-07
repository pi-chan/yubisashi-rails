export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';
export declare const resolveTheme: (mode: ThemeMode, systemPrefersDark: boolean) => ResolvedTheme;
export interface ThemeTokens {
    '--yubisashi-bg': string;
    '--yubisashi-bg-secondary': string;
    '--yubisashi-text': string;
    '--yubisashi-text-muted': string;
    '--yubisashi-border': string;
    '--yubisashi-primary': string;
    '--yubisashi-primary-hover': string;
    '--yubisashi-primary-text': string;
    '--yubisashi-primary-bg': string;
    '--yubisashi-muted': string;
    '--yubisashi-hover': string;
    '--yubisashi-shadow': string;
    '--yubisashi-overlay-bg': string;
    '--yubisashi-overlay-border': string;
    '--yubisashi-danger': string;
    '--yubisashi-danger-bg': string;
}
export declare const LIGHT_TOKENS: ThemeTokens;
export declare const DARK_TOKENS: ThemeTokens;
export declare const getTokens: (theme: ResolvedTheme) => ThemeTokens;
