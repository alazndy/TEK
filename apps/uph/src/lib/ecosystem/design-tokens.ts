// Design Tokens - Paylaşımlı Tema Sistemi
// Bu dosya tüm uygulamalar tarafından kullanılabilir

export const colors = {
  // Primary - Ana renk (tüm uygulamalarda kullanılır)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Secondary
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Semantic colors
  success: {
    light: '#22c55e',
    DEFAULT: '#16a34a',
    dark: '#15803d',
  },
  warning: {
    light: '#facc15',
    DEFAULT: '#eab308',
    dark: '#ca8a04',
  },
  error: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#38bdf8',
    DEFAULT: '#0ea5e9',
    dark: '#0284c7',
  },
  
  // App-specific accent colors
  apps: {
    'ENV-I': '#22c55e', // Green for inventory
    'UPH': '#3b82f6', // Blue for project hub
    'Weave': '#8b5cf6', // Purple for schematic
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export const animation = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
  },
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  dropdown: 1000,
  modal: 1100,
  tooltip: 1200,
  toast: 1300,
};

// CSS Custom Properties generator
export function generateCSSVariables(): string {
  const vars: string[] = [];
  
  // Primary colors
  Object.entries(colors.primary).forEach(([key, value]) => {
    vars.push(`--color-primary-${key}: ${value};`);
  });
  
  // Secondary colors
  Object.entries(colors.secondary).forEach(([key, value]) => {
    vars.push(`--color-secondary-${key}: ${value};`);
  });
  
  // Semantic colors
  vars.push(`--color-success: ${colors.success.DEFAULT};`);
  vars.push(`--color-warning: ${colors.warning.DEFAULT};`);
  vars.push(`--color-error: ${colors.error.DEFAULT};`);
  vars.push(`--color-info: ${colors.info.DEFAULT};`);
  
  // App colors
  Object.entries(colors.apps).forEach(([key, value]) => {
    vars.push(`--color-app-${key.toLowerCase()}: ${value};`);
  });
  
  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    vars.push(`--spacing-${key}: ${value};`);
  });
  
  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    vars.push(`--radius-${key === 'DEFAULT' ? 'default' : key}: ${value};`);
  });
  
  return `:root {\n  ${vars.join('\n  ')}\n}`;
}

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Theme configuration
export interface ThemeConfig {
  theme: Theme;
  primaryColor?: keyof typeof colors.primary;
  borderRadius?: keyof typeof borderRadius;
  reducedMotion?: boolean;
}

const THEME_KEY = 'ecosystem_theme_config';

export function getThemeConfig(): ThemeConfig {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored ? JSON.parse(stored) : { theme: 'system' };
  } catch {
    return { theme: 'system' };
  }
}

export function updateThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
  const current = getThemeConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(THEME_KEY, JSON.stringify(updated));
  return updated;
}

export function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement;
  
  // Apply theme
  if (config.theme === 'dark' || 
      (config.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Apply reduced motion
  if (config.reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}
