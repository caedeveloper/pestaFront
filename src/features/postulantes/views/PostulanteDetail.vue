<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiAddCard from '@/components/shared/UiAddCard.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { etiqueta, iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
import { relacionesTutor } from '../postulantes.catalogos';
import type { TutorEntidadId } from '../postulantes.types';

const router = useRouter();
const route = useRoute();
const store = useRegistroPostulanteStore();
const authStore = useAuthStore();

onMounted(async () => {
    await store.cargarRegistro();
    const postulanteId = Number(route.params.postulanteId);
    const registro = store.registros.find((item) => item.postulanteId === postulanteId);
    const asignado = registro && registroAsignadoA(registro, authStore.user?.tutorId ?? null, authStore.user?.username ?? '');
    if (!asignado || !store.seleccionarPostulante(postulanteId)) router.replace({ name: 'postulantes' });
});

const nombre = computed(() => nombreCompleto(store.postulante));
const avance = computed(() => store.avanceDe('postulante'));
const tutores = computed(() => [
    { entidad: 'tutor-principal' as const, tutor: store.tutorPrincipal },
    { entidad: 'tutor-segundo' as const, tutor: store.tutorSegundo }
].filter(({ tutor }) => Boolean(tutor.nombres)));

function editarTutor(entidad: TutorEntidadId) {
    router.push({
        name: 'postulante-tutor-registro',
        params: { postulanteId: store.postulanteId, tutorId: store.tutorIdDe(entidad) }
    });
}

function editarPostulante() {
    router.push({ name: 'postulante-registro', params: { postulanteId: store.postulanteId } });
}
</script>

<template>
    <section aria-labelledby="detalle-postulante">
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'postulantes' })">
            Mis postulantes
        </v-btn>

        <HeinrichHeroBanner id="detalle-postulante" :title="nombre" subtitle="Registro de postulante · Convocatoria 2027" />

        <UiParentCard title="Datos del postulante" icon="mdi-account-outline" class="mb-6">
            <v-card variant="outlined">
                <v-card-item>
                    <template #prepend>
                        <v-avatar color="lightprimary"><v-icon color="primary">mdi-account-outline</v-icon></v-avatar>
                    </template>
                    <v-card-title class="admission-section-title">Información de {{ store.postulante.nombres.split(' ')[0] }}</v-card-title>
                    <v-card-subtitle>{{ avance.completas }} de {{ avance.total }} secciones completas</v-card-subtitle>
                    <template #append><v-chip color="primary" size="small" variant="tonal">{{ avance.porcentaje }}%</v-chip></template>
                </v-card-item>
                <v-card-actions class="justify-end px-4 pb-4">
                    <v-btn color="primary" variant="text" append-icon="mdi-chevron-right" @click="editarPostulante">Completar información</v-btn>
                </v-card-actions>
            </v-card>
        </UiParentCard>

        <UiParentCard title="Tutores vinculados" icon="mdi-account-group-outline">
            <v-card v-for="item in tutores" :key="item.entidad" variant="outlined" class="mb-3" role="button" tabindex="0" @click="editarTutor(item.entidad)" @keydown.enter="editarTutor(item.entidad)">
                <v-card-item>
                    <template #prepend><v-avatar color="lightprimary"><span class="text-primary font-weight-bold">{{ iniciales(item.tutor) }}</span></v-avatar></template>
                    <v-card-title class="admission-section-title">{{ nombreCompleto(item.tutor) }}</v-card-title>
                    <v-card-subtitle>{{ etiqueta(relacionesTutor, item.tutor.relacionTutorId) }} · Tutor vinculado</v-card-subtitle>
                    <template #append><v-icon>mdi-chevron-right</v-icon></template>
                </v-card-item>
            </v-card>
            <UiAddCard title="Agregar tutor" @click="editarTutor('tutor-segundo')" />
        </UiParentCard>
    </section>
</template>
