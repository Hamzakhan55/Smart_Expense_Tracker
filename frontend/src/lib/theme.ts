export const themeConfig = {
  light: {
    background: {
      primary: 'from-slate-50 via-blue-50 to-indigo-100',
      secondary: 'from-white via-slate-50 to-blue-50',
      card: 'bg-white/70 backdrop-blur-sm',
      modal: 'bg-white/95 backdrop-blur-xl',
    },
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      accent: 'text-blue-600',
    },
    border: {
      primary: 'border-white/20',
      secondary: 'border-slate-200/50',
      accent: 'border-blue-200',
    },
    shadow: {
      card: 'shadow-xl shadow-slate-200/50',
      modal: 'shadow-2xl shadow-slate-900/10',
    }
  },
  dark: {
    background: {
      primary: 'from-slate-900 via-slate-800 to-slate-900',
      secondary: 'from-slate-800 via-slate-700 to-slate-800',
      card: 'bg-slate-800/70 backdrop-blur-sm',
      modal: 'bg-slate-800/95 backdrop-blur-xl',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      muted: 'text-slate-400',
      accent: 'text-blue-400',
    },
    border: {
      primary: 'border-slate-700/50',
      secondary: 'border-slate-600/50',
      accent: 'border-blue-700',
    },
    shadow: {
      card: 'shadow-xl shadow-slate-900/20',
      modal: 'shadow-2xl shadow-slate-900/30',
    }
  }
};

export type ThemeMode = 'light' | 'dark';
export type ThemeConfig = typeof themeConfig.light;