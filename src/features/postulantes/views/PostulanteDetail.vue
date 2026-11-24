<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichStageRenderer from '@/components/heinrich/HeinrichStageRenderer.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { admissionCalls } from '@/features/admission-calls/admission-calls.services';
import { obtenerApplicantApplicationCache, asegurarApplicantApplicationsCache, persistirApplicantApplicationsCache } from '@/features/applicant-applications/applicant-applications.services';
import { nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
import { obtenerEffectiveStageGuardianPermissions, validarStageAvailability } from '@/features/admission-calls/admission-calls.helpers';
const router = useRouter(); const route = useRoute(); const store = useRegistroPostulanteStore(); const auth = useAuthStore(); const dirty = ref(false); const saved = ref(false);
const postulanteId = computed(() => Number(route.params.postulanteId));
const registro = computed(() => store.registros.find(item => item.postulanteId === postulanteId.value));
const admission = computed(() => obtenerApplicantApplicationCache(postulanteId.value));
const convocatoria = computed(() => admissionCalls.value.find(item => item.id === admission.value?.convocatoriaId));
const stage = computed(() => convocatoria.value?.etapas.find(item => item.id === admission.value?.etapaActualId));
const now = computed(() => new Date()); const editable = computed(() => validarStageAvailability(stage.value, now.value) && obtenerEffectiveStageGuardianPermissions(stage.value, now.value).canEditDocuments);
const nombre = computed(() => registro.value ? nombreCompleto(registro.value.postulante) : 'Postulante');
onMounted(async () => { await store.cargarRegistro(); const allowed = registro.value && registroAsignadoA(registro.value, auth.user?.tutorId ?? null, auth.user?.username ?? ''); const call = admissionCalls.value.find(item => item.etapas.length) || admissionCalls.value[0]; if (call) asegurarApplicantApplicationsCache(store.registros, call.id, call.etapas); if (!allowed) router.replace({ name: 'postulantes' }); });
function save() { if (!admission.value) return; persistirApplicantApplicationsCache(); dirty.value = false; saved.value = true; }
</script>
<template><section><v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'postulantes' })">Volver a mis postulaciones</v-btn><HeinrichHeroBanner :title="nombre" :subtitle="convocatoria?.nombre || 'Postulación'" /><UiParentCard title="Información del postulante" icon="mdi-account-outline" class="mb-6"><v-row><v-col cols="12" md="4"><b>Nombre</b><div>{{ nombre }}</div></v-col><v-col cols="12" md="4"><b>AdmissionCall</b><div>{{ convocatoria?.nombre || 'Sin asignar' }}</div></v-col><v-col cols="12" md="4"><b>Nivel / grado</b><div>{{ convocatoria?.grado || convocatoria?.nivel || 'Sin definir' }}</div></v-col><v-col cols="12"><b>Etapa actual</b><div>{{ stage?.nombre || 'Registro inicial' }}</div></v-col></v-row></UiParentCard><UiParentCard v-if="stage && admission" :title="stage.nombre" :subtitle="stage.descripcion" icon="mdi-format-list-bulleted-square"><template #action><v-chip v-if="!editable" color="warning" size="small" variant="tonal">Solo lectura</v-chip></template><div v-if="stage.fechaCierre" class="text-caption text-medium-emphasis mb-4">Cierre de actividades: {{ new Date(stage.fechaCierre).toLocaleString() }}</div><HeinrichStageRenderer :stage="stage" :postulante-id="postulanteId" :data="admission.respuestas" :mode="editable ? 'editable' : 'readonly'" @changed="dirty = true" /><template #footer-actions><v-btn v-if="editable && dirty" color="primary" @click="save">Guardar cambios</v-btn></template></UiParentCard><v-alert v-else type="info" variant="tonal">Aún no hay una etapa de admisión asignada para este postulante.</v-alert><v-snackbar v-model="saved" color="success">Cambios guardados localmente.</v-snackbar></section></template>
