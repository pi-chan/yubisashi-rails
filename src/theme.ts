export type ThemeMode = 'light' | 'dark' | 'auto'
export type ResolvedTheme = 'light' | 'dark'

export const resolveTheme = (
  mode: ThemeMode,
  systemPrefersDark: boolean,
): ResolvedTheme => {
  if (mode === 'light' || mode === 'dark') return mode
  return systemPrefersDark ? 'dark' : 'light'
}

export interface ThemeTokens {
  '--yubisashi-bg': string
  '--yubisashi-bg-secondary': string
  '--yubisashi-text': string
  '--yubisashi-text-muted': string
  '--yubisashi-border': string
  '--yubisashi-primary': string
  '--yubisashi-primary-hover': string
  '--yubisashi-primary-text': string
  '--yubisashi-primary-bg': string
  '--yubisashi-muted': string
  '--yubisashi-hover': string
  '--yubisashi-shadow': string
  '--yubisashi-overlay-bg': string
  '--yubisashi-overlay-border': string
  '--yubisashi-danger': string
  '--yubisashi-danger-bg': string
}

export const LIGHT_TOKENS: ThemeTokens = {
  '--yubisashi-bg': '#fff',
  '--yubisashi-bg-secondary': '#f8fafc',
  '--yubisashi-text': '#334155',
  '--yubisashi-text-muted': '#94a3b8',
  '--yubisashi-border': '#e2e8f0',
  '--yubisashi-primary': '#6366f1',
  '--yubisashi-primary-hover': '#4f46e5',
  '--yubisashi-primary-text': '#fff',
  '--yubisashi-primary-bg': '#eef2ff',
  '--yubisashi-muted': '#64748b',
  '--yubisashi-hover': '#f1f5f9',
  '--yubisashi-shadow': 'rgba(0, 0, 0, 0.12)',
  '--yubisashi-overlay-bg': 'rgba(99, 102, 241, 0.15)',
  '--yubisashi-overlay-border': 'rgba(99, 102, 241, 0.6)',
  '--yubisashi-danger': '#ef4444',
  '--yubisashi-danger-bg': '#fef2f2',
}

export const DARK_TOKENS: ThemeTokens = {
  '--yubisashi-bg': '#1e293b',
  '--yubisashi-bg-secondary': '#0f172a',
  '--yubisashi-text': '#e2e8f0',
  '--yubisashi-text-muted': '#64748b',
  '--yubisashi-border': '#334155',
  '--yubisashi-primary': '#818cf8',
  '--yubisashi-primary-hover': '#6366f1',
  '--yubisashi-primary-text': '#fff',
  '--yubisashi-primary-bg': 'rgba(99, 102, 241, 0.15)',
  '--yubisashi-muted': '#94a3b8',
  '--yubisashi-hover': '#334155',
  '--yubisashi-shadow': 'rgba(0, 0, 0, 0.3)',
  '--yubisashi-overlay-bg': 'rgba(129, 140, 248, 0.2)',
  '--yubisashi-overlay-border': 'rgba(129, 140, 248, 0.6)',
  '--yubisashi-danger': '#f87171',
  '--yubisashi-danger-bg': 'rgba(239, 68, 68, 0.1)',
}

export const getTokens = (theme: ResolvedTheme): ThemeTokens => {
  return theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS
}

