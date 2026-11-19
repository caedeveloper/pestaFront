import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
// import VueApexCharts from 'vue3-apexcharts'; // Demostración desactivada.
// import VueTablerIcons from 'vue-tabler-icons'; // Registrar solo iconos usados en cada componente.
// import { fakeBackend } from '@/utils/helpers/fake-backend'; // Demostración desactivada.
// import 'vue3-carousel/dist/carousel.css'; // Demostración desactivada.
//Mock Api data
// import './_mockApis'; // Demostración desactivada.

import { vMaska } from 'maska/vue';

//i18
import { createI18n } from 'vue-i18n';
import messages from '@/utils/locales/messages';

//ScrollTop
import VueScrollTo from 'vue-scrollto';

//LightBox
// import VueEasyLightbox from 'vue-easy-lightbox'; // Demostración desactivada.



const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'en',
    messages: { ...messages, es: { Inicio: 'Inicio', 'Admisión': 'Admisión', 'Registrar postulante': 'Registrar postulante' } },
    silentTranslationWarn: true,
    silentFallbackWarn: true
});

const app = createApp(App);
// fakeBackend(); // Demostración desactivada.
app.use(createPinia());
app.use(router);

app.component('PerfectScrollbar', PerfectScrollbar);
// app.use(VueDragscroll);

// app.use(VueTablerIcons);

app.use(i18n);
app.directive('maska', vMaska);
// app.component('apexchart', VueApexCharts); // Demostración desactivada.
app.use(vuetify);

//ScrollTop Use
// app.use(VueScrollTo);
app.use(VueScrollTo, {
    duration: 1000,
    easing: "ease",
})
//Lightbox
// app.use(VueEasyLightbox) // Demostración desactivada.

app.mount('#app');
