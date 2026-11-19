import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
//DragScroll
import { VueDraggableNext } from 'vue-draggable-next';

import { HEINRICH_THEME } from '@/theme/HeinrichTheme';
// Temas de demostración conservados, sin registro activo.
// // import { BLUE_THEME} from '@/theme/LightTheme';
// import { BLUE_THEME} from '@/theme/LightTheme';
// import {
//     DARK_BLUE_THEME,
//     DARK_AQUA_THEME,
//     DARK_ORANGE_THEME,
//     DARK_PURPLE_THEME,
//     DARK_GREEN_THEME,
//     DARK_CYAN_THEME
// } from '@/theme/DarkTheme';
//

export default createVuetify({
    components: {
        ...components,
        draggable: VueDraggableNext
    },
    directives,
    display: {
        thresholds: {
            md: 960,
            lg: 1280,
            xl: 1920,
            xxl: 2560
        }
    },

    theme: {
        defaultTheme: 'HEINRICH_THEME',
        themes: { HEINRICH_THEME }
    },
    defaults: {
        VCard: {
            rounded: 'md',
            elevation: 10
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VTextarea: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VCombobox: { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VFileInput: { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VAutocomplete: { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VListItem: {
            minHeight: '45px'
        },
        VTooltip: {
            location: 'top'
        },
    }
});
