<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UiAddCard from '@/components/shared/UiAddCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';

const router = useRouter();
const store = useRegistroPostulanteStore();
const authStore = useAuthStore();

onMounted(() => store.cargarRegistro());

const postulantes = computed(() => store.registros.filter((registro) => registroAsignadoA(registro, authStore.user?.tutorId ?? null, authStore.user?.username ?? '')).map((registro) => ({
    id: registro.postulanteId,
    nombre: nombreCompleto(registro.postulante),
    iniciales: iniciales(registro.postulante),
    avance: store.avanceDeRegistro(registro, 'postulante'),
    tutores: [registro.tutorPrincipal, registro.tutorSegundo].filter((tutor) => Boolean(tutor.nombres)).length
})));

function registrar(postulanteId: number) {
    router.push({ name: 'postulante-registro', params: { postulanteId } });
}

function detalle(postulanteId: number) {
    router.push({ name: 'postulante-detalle', params: { postulanteId } });
}

async function agregarPostulante() {
    const tutorId = authStore.user?.tutorId;
    if (tutorId) {
        const postulanteId = await store.crearPostulanteParaTutor(tutorId);
        if (postulanteId) {
            router.push({ name: 'postulante-tutor-responsable-nuevo', params: { tutorId } });
            return;
        }
    }
    const nuevoTutorId = await store.iniciarPostulanteConTutorNuevo();
    router.push({ name: 'postulante-tutor-responsable-nuevo', params: { tutorId: nuevoTutorId } });
}
</script>

<template>
    <section aria-labelledby="mis-postulantes">
        <HeinrichHeroBanner id="mis-postulantes" title="Mis postulantes" subtitle="Gestiona las solicitudes de admisión de tus hijos." />

        <UiParentCard title="Postulantes registrados" icon="mdi-account-school-outline">
            <v-card v-for="postulante in postulantes" :key="postulante.id" variant="outlined" class="applicant-card position-relative mb-4">
                <div class="applicant-card__header">
                    <div class="d-flex align-center">
                        <v-avatar color="lightprimary" size="52" class="me-3 flex-shrink-0">
                            <span class="text-primary font-weight-bold">{{ postulante.iniciales }}</span>
                        </v-avatar>
                        <div>
                            <div class="applicant-card__name">{{ postulante.nombre }}</div>
                            <div class="applicant-card__subtitle text-medium-emphasis">Postulante · Admisión 2027</div>
                        </div>
                    </div>
                    <v-chip class="applicant-card__status" size="small" color="warning" variant="tonal">En proceso</v-chip>
                </div>

                <v-card-text class="applicant-card__body">
                    <v-row align="center">
                        <v-col cols="12">
                            <div class="d-flex justify-space-between align-center mb-2">
                                <span class="text-body-2">Progreso del registro</span>
                                <strong class="text-body-2">{{ postulante.avance.porcentaje }}%</strong>
                            </div>
                            <v-progress-linear :model-value="postulante.avance.porcentaje" color="primary" height="8" rounded />
                        </v-col>
                        <v-col cols="12" class="d-flex justify-end ga-8 text-body-2 text-medium-emphasis">
                            <span>{{ postulante.avance.completas }} de {{ postulante.avance.total }} secciones completas</span>
                            <span>{{ postulante.tutores }} tutores</span>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />
                <v-card-actions class="pa-4 justify-end">
                    <v-btn color="primary" variant="tonal" @click="registrar(postulante.id)">Continuar registro</v-btn>
                    <v-btn variant="text" @click="detalle(postulante.id)">Ver detalle</v-btn>
                </v-card-actions>
            </v-card>

            <UiAddCard title="Registrar otro hijo" @click="agregarPostulante" />
        </UiParentCard>
    </section>
</template>

<style scoped>
.applicant-card__header {
    min-height: 126px;
    padding: 16px;
    position: relative;
}

.applicant-card__status {
    position: absolute;
    right: 16px;
    bottom: 16px;
}

.applicant-card__name {
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.75rem;
}

.applicant-card__subtitle {
    font-size: 0.6875rem;
    line-height: 1rem;
    white-space: nowrap;
}
</style>
