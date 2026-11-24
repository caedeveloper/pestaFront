<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichStageRenderer from '@/components/heinrich/HeinrichStageRenderer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { nombreCompleto } from '@/features/postulantes/postulantes.helpers';
import MdlCambiarStageApplicantApplication from '../components/MdlCambiarStageApplicantApplication.vue';
import useApplicantApplicationsService from '../applicant-applications.services';
import type { ApplicantApplicationDetail } from '../applicant-applications.types';

const router = useRouter();
const route = useRoute();
const service = useApplicantApplicationsService();
const active = ref('stage');
const changing = ref(false);
const moving = ref(false);
const loading = ref(false);
const loadError = ref('');
const moveError = ref('');
const success = ref('');
const detail = ref<ApplicantApplicationDetail>();
const postulanteId = computed(() => Number(route.params.postulanteId));
const nombre = computed(() => detail.value ? nombreCompleto(detail.value.registro.postulante) : 'Postulante');
let loadRequestId = 0;

async function cargar(id: number): Promise<void> {
    const requestId = ++loadRequestId;
    detail.value = undefined;
    loading.value = true;
    loadError.value = '';
    changing.value = false;
    if (!Number.isInteger(id) || id < 1) { loading.value = false; return; }
    try {
        const result = await service.obtenerApplicantApplicationDetail(id);
        if (requestId === loadRequestId) detail.value = result;
    } catch {
        if (requestId === loadRequestId) loadError.value = 'No se pudo cargar el detalle del postulante.';
    } finally {
        if (requestId === loadRequestId) loading.value = false;
    }
}
watch(postulanteId, id => { void cargar(id); }, { immediate: true });

async function cambiarStageApplicantApplication(destinationId: string, observation: string): Promise<void> {
    if (!detail.value?.application || moving.value) return;
    const id = postulanteId.value;
    moving.value = true;
    moveError.value = '';
    try {
        await service.moverApplicantApplicationStage({ postulanteId: id, destinoId: destinationId, observacion: observation });
        const refreshed = await service.obtenerApplicantApplicationDetail(id);
        if (id === postulanteId.value && refreshed) {
            detail.value = refreshed;
            changing.value = false;
            success.value = 'La etapa del postulante se actualizó correctamente.';
        }
    } catch (reason) {
        if (id === postulanteId.value) moveError.value = reason instanceof Error ? reason.message : 'No se pudo cambiar la etapa del postulante.';
    } finally {
        moving.value = false;
    }
}
</script>
<template>
    <section>
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'admision-postulantes' })">Volver a postulantes</v-btn>
        <v-alert v-if="loading" type="info" variant="tonal">Cargando detalle del postulante…</v-alert>
        <v-alert v-else-if="loadError" type="error" variant="tonal">{{ loadError }} <v-btn variant="text" @click="cargar(postulanteId)">Reintentar</v-btn></v-alert>
        <v-alert v-else-if="!detail" type="warning" variant="tonal">No se encontró el postulante solicitado.</v-alert>
        <template v-else>
            <HeinrichHeroBanner :title="nombre" :subtitle="detail.convocatoria?.nombre || 'Postulante'" />
            <v-alert v-if="success" type="success" variant="tonal" class="mb-4" closable @click:close="success = ''">{{ success }}</v-alert>
            <UiParentCard title="Información del postulante" icon="mdi-account-outline" class="mb-6">
                <v-row>
                    <v-col cols="12" md="4"><b>Convocatoria</b><div>{{ detail.convocatoria?.nombre || '—' }}</div></v-col>
                    <v-col cols="12" md="4"><b>Nivel / grado</b><div>{{ detail.convocatoria?.grado || detail.convocatoria?.nivel || '—' }}</div></v-col>
                    <v-col cols="12" md="4"><b>Etapa actual</b><div>{{ detail.etapaActual?.nombre || 'Sin etapa asignada' }}</div></v-col>
                </v-row>
            </UiParentCard>
            <UiParentCard>
                <v-tabs v-model="active"><v-tab value="stage">Etapa actual</v-tab><v-tab value="registration">Registro</v-tab><v-tab value="history">Historial</v-tab></v-tabs>
                <v-divider class="mb-5" />
                <div v-if="active === 'stage'">
                    <div class="d-flex justify-space-between align-start mb-4">
                        <div><div class="text-h6">{{ detail.etapaActual?.nombre || 'Sin etapa asignada' }}</div><div class="text-body-2 text-medium-emphasis">{{ detail.etapaActual?.descripcion }}</div></div>
                        <v-btn color="primary" :disabled="!detail.destinosDisponibles.length" @click="changing = true">Cambiar etapa</v-btn>
                    </div>
                    <v-alert v-if="!detail.destinosDisponibles.length" type="info" variant="tonal" density="compact" class="mb-4">{{ detail.etapaActual ? 'No existen etapas destino configuradas para la etapa actual.' : 'No hay una etapa inicial configurada en esta convocatoria.' }}</v-alert>
                    <HeinrichStageRenderer v-if="detail.etapaActual && detail.application" :stage="detail.etapaActual"
                        :postulante-id="postulanteId" :data="detail.application.respuestas" mode="readonly" />
                </div>
                <div v-else-if="active === 'registration'">
                    <UiParentCard title="Datos del postulante" icon="mdi-account-outline" class="mb-4"><v-row>
                        <v-col cols="12" md="6"><b>Nombre</b><div>{{ nombre }}</div></v-col>
                        <v-col cols="12" md="6"><b>Documento</b><div>{{ detail.registro.postulante.documentoIdentidad || '—' }}</div></v-col>
                    </v-row></UiParentCard>
                    <UiParentCard title="Tutor responsable" icon="mdi-account-star-outline">
                        <div>{{ nombreCompleto(detail.registro.tutorPrincipal) }}</div>
                        <div class="text-body-2 text-medium-emphasis">{{ detail.registro.tutorPrincipal.correoElectronico || 'Sin correo' }} · {{ detail.registro.tutorPrincipal.telefonoCelular || 'Sin teléfono' }}</div>
                    </UiParentCard>
                </div>
                <div v-else>
                    <v-timeline side="end" density="compact">
                        <v-timeline-item v-for="entry in detail.application?.historial ?? []" :key="`${entry.fecha}-${entry.destinoId}`" dot-color="primary">
                            <div class="font-weight-medium">{{ detail.convocatoria?.etapas.find(item => item.id === entry.destinoId)?.nombre || 'Etapa' }}</div>
                            <div class="text-caption text-medium-emphasis">{{ new Date(entry.fecha).toLocaleString() }} · {{ entry.responsable || '—' }}</div>
                            <div v-if="entry.observacion" class="text-body-2">{{ entry.observacion }}</div>
                        </v-timeline-item>
                    </v-timeline>
                </div>
            </UiParentCard>
            <MdlCambiarStageApplicantApplication v-model:show="changing" :applicant-name="nombre"
                :current-stage-name="detail.etapaActual?.nombre" :destinations="detail.destinosDisponibles"
                :loading="moving" :error="moveError" @confirmar="cambiarStageApplicantApplication" />
        </template>
    </section>
</template>
