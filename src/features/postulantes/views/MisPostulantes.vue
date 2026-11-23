<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { convocatorias } from '@/features/admision/convocatorias.store';
import { admissionFor, ensureApplicantAdmissions } from '@/features/admision/admissionOperational.store';
import { iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
const router = useRouter(); const store = useRegistroPostulanteStore(); const authStore = useAuthStore();
const convocatoria = computed(() => convocatorias.value.find(item => item.etapas.length) || convocatorias.value[0]);
onMounted(async () => { await store.cargarRegistro(); if (convocatoria.value) ensureApplicantAdmissions(store.registros, convocatoria.value.id, convocatoria.value.etapas); });
const postulaciones = computed(() => store.registros.filter(registro => registroAsignadoA(registro, authStore.user?.tutorId ?? null, authStore.user?.username ?? '')).map(registro => {
  const admission = admissionFor(registro.postulanteId); const call = convocatorias.value.find(item => item.id === admission?.convocatoriaId) || convocatoria.value; const stage = call?.etapas.find(item => item.id === admission?.etapaActualId);
  return { id: registro.postulanteId, nombre: nombreCompleto(registro.postulante), iniciales: iniciales(registro.postulante), convocatoria: call?.nombre || 'Sin convocatoria', grado: call?.grado || call?.nivel || 'Sin definir', etapa: stage?.nombre || 'Registro inicial' };
}));
</script>
<template><section aria-labelledby="mis-postulaciones"><HeinrichHeroBanner id="mis-postulaciones" title="Mis postulaciones" subtitle="Consulta y realiza el seguimiento del proceso de admisión de tus hijos." /><UiParentCard title="Postulaciones registradas" icon="mdi-account-school-outline"><v-empty-state v-if="!postulaciones.length" icon="mdi-account-search-outline" title="No tienes postulaciones registradas." text="Cuando registres a un hijo, su proceso de admisión aparecerá aquí." /><v-row v-else><v-col v-for="postulacion in postulaciones" :key="postulacion.id" cols="12" md="6"><v-card variant="outlined" class="h-100"><v-card-item><template #prepend><v-avatar color="lightprimary" size="48"><span class="text-primary font-weight-bold">{{ postulacion.iniciales }}</span></v-avatar></template><v-card-title>{{ postulacion.nombre }}</v-card-title><v-card-subtitle>{{ postulacion.grado }}</v-card-subtitle></v-card-item><v-card-text><div class="text-body-2 mb-2"><b>Convocatoria:</b> {{ postulacion.convocatoria }}</div><div class="text-body-2"><b>Etapa actual:</b> {{ postulacion.etapa }}</div></v-card-text><v-card-actions class="justify-end px-4 pb-4"><v-btn color="primary" variant="tonal" @click="router.push({ name: 'postulante-detalle', params: { postulanteId: postulacion.id } })">Ver detalle</v-btn></v-card-actions></v-card></v-col></v-row></UiParentCard></section></template>
