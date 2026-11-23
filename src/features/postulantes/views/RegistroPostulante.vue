<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import FormularioPostulante from '../components/FormularioPostulante.vue';
import FormularioTutor from '../components/FormularioTutor.vue';
import { registroAsignadoA } from '../postulantes.helpers';
import { convocatorias } from '@/features/admision/convocatorias.store';
import { admissionFor } from '@/features/admision/admissionOperational.store';
import { effectiveStageTutorPermissions } from '@/features/admision/stageTutorPermissions';

const route = useRoute();
const router = useRouter();
const store = useRegistroPostulanteStore();
const authStore = useAuthStore();

const entidad = computed(() => {
    if (route.name === 'postulante-tutor-responsable-nuevo' || route.name === 'postulante-tutor-registro') return store.entidadDeTutor(Number(route.params.tutorId));
    if (route.name === 'postulante-registro') return 'postulante';
    return null;
});
const stage = computed(() => {
    const admission = admissionFor(Number(route.params.postulanteId));
    const call = convocatorias.value.find(item => item.id === admission?.convocatoriaId);
    return call?.etapas.find(item => item.id === admission?.etapaActualId);
});
const registroActual = computed(() => store.registros.find(item => item.postulanteId === Number(route.params.postulanteId)));
const soloLectura = computed(() => {
    if (!stage.value || route.name === 'postulante-tutor-responsable-nuevo') return false;
    const permissions = effectiveStageTutorPermissions(stage.value);
    if (entidad.value === 'postulante') return !permissions.canEditApplicant;
    const esTutorResponsable = !authStore.user?.tutorId || registroActual.value?.tutorPrincipalId === authStore.user.tutorId;
    if (route.query.operation === 'add') return !permissions.canAddTutors || !esTutorResponsable;
    const tutorId = Number(route.params.tutorId);
    const esElPropioTutor = !authStore.user?.tutorId || authStore.user.tutorId === tutorId;
    return !permissions.canEditOwnData || (!esTutorResponsable && !esElPropioTutor);
});

function volver() {
    if (store.registroNuevo) {
        router.push({ name: 'postulantes' });
        return;
    }
    router.push({ name: 'postulante-detalle', params: { postulanteId: store.postulanteId } });
}

function esDelUsuarioActual() {
    const registro = store.registros.find((item) => item.postulanteId === store.postulanteId);
    if (!registro) return false;
    if (!authStore.user?.tutorId && route.name === 'postulante-tutor-responsable-nuevo') {
        const tutorId = Number(route.params.tutorId);
        return tutorId === store.tutorPrincipalId || tutorId === store.tutorSegundoId;
    }
    return registroAsignadoA(registro, authStore.user?.tutorId ?? null, authStore.user?.username ?? '');
}

function esRutaValida() {
    if (!esDelUsuarioActual()) return false;
    if (route.name === 'postulante-tutor-responsable-nuevo') {
        const tutorId = Number(route.params.tutorId);
        return tutorId === store.tutorPrincipalId || tutorId === store.tutorSegundoId;
    }
    return Number(route.params.postulanteId) === store.postulanteId && entidad.value !== null;
}

async function cargarPostulanteDeRuta() {
    await store.cargarRegistro();
    if (route.name === 'postulante-tutor-responsable-nuevo') {
        const tutorId = Number(route.params.tutorId);
        const coincidencias = store.registros.filter((registro) => {
            const esElTutor = registro.tutorPrincipalId === tutorId || registro.tutorSegundoId === tutorId;
            if (!esElTutor) return false;
            if (!authStore.user?.tutorId) return true;
            return registroAsignadoA(registro, authStore.user.tutorId, authStore.user.username);
        });
        const registro = coincidencias[coincidencias.length - 1];
        if (registro) store.seleccionarPostulante(registro.postulanteId);
    } else {
        store.seleccionarPostulante(Number(route.params.postulanteId));
    }
    if (!esRutaValida()) router.replace({ name: 'postulantes' });
}

onMounted(cargarPostulanteDeRuta);

watch([() => route.name, () => route.params.postulanteId, () => route.params.tutorId], () => {
    if (store.registroCargado) cargarPostulanteDeRuta();
});

watch(entidad, () => window.scrollTo({ top: 0 }));
</script>

<template>
    <FormularioPostulante v-if="store.registroCargado && entidad === 'postulante'" :readonly="soloLectura" @volver="volver" />
    <FormularioTutor v-else-if="store.registroCargado && (entidad === 'tutor-principal' || entidad === 'tutor-segundo')" :entidad="entidad" :readonly="soloLectura" @volver="volver" />
</template>
