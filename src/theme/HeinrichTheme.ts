// Tokens activos del WebFront; fuente: src/theme/HeinrichTheme.ts.
import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const HEINRICH_THEME: ThemeTypes = {
    name: 'HEINRICH_THEME',
    dark: false,
    variables: {
        'border-color': '#e5eaef',
        'border-opacity': 1,
        'table-header-background': '#F2F6FA',
        'table-cell-highlight-light-background': '#F2F6FA'
    },
    colors: {
        primary: '#de2826',
        secondary: '#49BEFF',
        info: '#009BFF',
        infoAccent: '#1975C5',
        success: '#50cd89',
        accent: '#FFAB91',
        warning: '#f0b100',
        error: '#f1416c',
        muted: '#8898aa',
        lightprimary: '#fff1f1',
        lightsecondary: '#EFF9FF',
        lightsuccess: '#e8fff3',
        lighterror: '#fff5f8',
        lightwarning: '#fff8dd',
        textPrimary: '#2A3547',
        textSecondary: '#2A3547',
        borderColor: '#e5eaef',
        inputBorder: '#DFE5EF',
        containerBg: '#ffffff',
        background: '#ffffff',
        hoverColor: '#f6f9fc',
        surface: '#fff',
        'on-surface-variant': '#fff',
        grey100: '#F2F6FA',
        grey200: '#EAEFF4',
        highlight: '#fff8dd'
    }
};

export { HEINRICH_THEME };
