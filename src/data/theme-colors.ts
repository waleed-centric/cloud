// Provider-specific theme colors for consistent UI across the application
// Dark theme colors matching the Cost Estimation section design

export interface ProviderTheme {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  gradient: {
    from: string;
    to: string;
  };
}

export const PROVIDER_THEMES: Record<string, ProviderTheme> = {
  aws: {
    primary: '#E5E7EB',           // AWS Orange
    primaryDark: '#E5E7EB',       // Darker orange
    secondary: '#232F3E',         // AWS Dark Blue
    accent: '#60A5FA',           // Blue accent (matching cost estimation)
    background: '#0F172A',        // Dark slate background (slate-900)
    surface: '#1E293B',          // Card surface (slate-800)
    text: '#E2E8F0',             // Primary text (slate-200)
    textSecondary: '#94A3B8',     // Secondary text (slate-400)
    border: '#334155',           // Border color (slate-700)
    hover: '#94A3B8',            // Hover state
    gradient: {
      from: '#FF9900',           // AWS Orange
      to: '#FF7700'              // Darker orange
    }
  },
  azure: {
    primary: '#0078D4',          // Azure Blue
    primaryDark: '#106EBE',      // Darker blue
    secondary: '#005A9E',        // Azure Dark Blue
    accent: '#60A5FA',           // Blue accent (matching cost estimation)
    background: '#0F172A',        // Dark slate background (slate-900)
    surface: '#1E293B',          // Card surface (slate-800)
    text: '#E2E8F0',             // Primary text (slate-200)
    textSecondary: '#94A3B8',     // Secondary text (slate-400)
    border: '#334155',           // Border color (slate-700)
    hover: '#106EBE',            // Hover state
    gradient: {
      from: '#0078D4',           // Azure Blue
      to: '#005A9E'              // Darker blue
    }
  },
  gcp: {
    primary: '#4285F4',          // Google Blue
    primaryDark: '#3367D6',      // Darker Google Blue
    secondary: '#34A853',        // Google Green
    accent: '#60A5FA',           // Blue accent (matching cost estimation)
    background: '#0F172A',        // Dark slate background (slate-900)
    surface: '#1E293B',          // Card surface (slate-800)
    text: '#E2E8F0',             // Primary text (slate-200)
    textSecondary: '#94A3B8',     // Secondary text (slate-400)
    border: '#334155',           // Border color (slate-700)
    hover: '#3367D6',            // Hover state
    gradient: {
      from: '#4285F4',           // Google Blue
      to: '#34A853'              // Google Green
    }
  }
};

// Helper function to get theme colors for current provider
export const getProviderTheme = (provider: string): ProviderTheme => {
  return PROVIDER_THEMES[provider] || PROVIDER_THEMES.aws;
};

// CSS custom properties generator for dynamic theming
export const generateThemeCSS = (provider: string): string => {
  const theme = getProviderTheme(provider);
  
  return `
    :root {
      --theme-primary: ${theme.primary};
      --theme-primary-dark: ${theme.primaryDark};
      --theme-secondary: ${theme.secondary};
      --theme-accent: ${theme.accent};
      --theme-background: ${theme.background};
      --theme-surface: ${theme.surface};
      --theme-text: ${theme.text};
      --theme-text-secondary: ${theme.textSecondary};
      --theme-border: ${theme.border};
      --theme-hover: ${theme.hover};
      --theme-gradient-from: ${theme.gradient.from};
      --theme-gradient-to: ${theme.gradient.to};
    }
  `;
};