<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UiAddCard from '@/components/shared/UiAddCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { admissionCalls } from '@/features/admission-calls/admission-calls.services';
import { obtenerApplicantApplicationCache, asegurarApplicantApplicationsCache } from '@/features/applicant-applications/applicant-applications.services';
import { iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
const router = useRouter(); const store = useRegistroPostulanteStore(); const authStore = useAuthStore();
const convocatoria = computed(() => admissionCalls.value.find(item => item.etapas.length) || admissionCalls.value[0]);
onMounted(async () => { await store.cargarRegistro(); if (convocatoria.value) asegurarApplicantApplicationsCache(store.registros, convocatoria.value.id, convocatoria.value.etapas); });
const postulaciones = computed(() => store.registros.filter(registro => registroAsignadoA(registro, authStore.user?.tutorId ?? null, authStore.user?.username ?? '')).map(registro => {
  const admission = obtenerApplicantApplicationCache(registro.postulanteId); const call = admissionCalls.value.find(item => item.id === admission?.convocatoriaId) || convocatoria.value; const stage = call?.etapas.find(item => item.id === admission?.etapaActualId);
  return { id: registro.postulanteId, nombre: nombreCompleto(registro.postulante), iniciales: iniciales(registro.postulante), convocatoria: call?.nombre || 'Sin convocatoria', grado: call?.grado || call?.nivel || 'Sin definir', etapa: stage?.nombre || 'Registro inicial' };
}));
async function agregarPostulante() {
  const tutorId = authStore.user?.tutorId;
  if (!tutorId) return;
  const postulanteId = await store.crearPostulanteParaTutor(tutorId);
  if (postulanteId) router.push({ name: 'postulante-tutor-responsable-nuevo', params: { tutorId } });
}
</script>
<template>
  <section aria-labelledby="mis-postulaciones">
    <HeinrichHeroBanner id="mis-postulaciones" title="Mis postulaciones"
      subtitle="Consulta y realiza el seguimiento del proceso de admisión de tus hijos." />
    <UiParentCard title="Postulaciones registradas" icon="mdi-account-school-outline"><v-empty-state
        v-if="!postulaciones.length" icon="mdi-account-search-outline" title="No tienes postulaciones registradas."
        text="Cuando registres a un hijo, su proceso de admisión aparecerá aquí." /><v-row v-else><v-col
          v-for="postulacion in postulaciones" :key="postulacion.id" cols="12"><v-card variant="outlined"
            class="postulation-card h-100"><v-card-item><template #prepend><v-avatar color="lightprimary"
                  size="48"><span class="text-primary font-weight-bold">{{ postulacion.iniciales
                    }}</span></v-avatar></template><v-card-title>{{
                postulacion.nombre }}</v-card-title><v-card-subtitle>{{ postulacion.grado
                }}</v-card-subtitle></v-card-item><v-card-text>
              <div class="text-body-2 mb-2"><b>AdmissionCall:</b> {{ postulacion.convocatoria }}</div>
              <div class="text-body-2"><b>Etapa actual:</b> {{ postulacion.etapa }}</div>
            </v-card-text><v-card-actions class="justify-end flex-wrap px-4 pb-4 ga-2"><v-btn variant="outlined"
                @click="router.push({ name: 'postulante-datos', params: { postulanteId: postulacion.id } })">Ver
                datos</v-btn><v-btn color="primary"
                @click="router.push({ name: 'postulante-detalle', params: { postulanteId: postulacion.id } })">
                Ver detalle</v-btn></v-card-actions></v-card></v-col><v-col cols="12">
          <UiAddCard class="postulation-card register-applicant-card" title="Registrar otro postulante"
            @click="agregarPostulante" />
        </v-col></v-row></UiParentCard>
  </section>
</template>
<style
  scoped>
  .postulation-card {
    min-height: 198px;
  }

  .register-applicant-card {
    display: flex;
  }

  .register-applicant-card :deep(.v-card-text) {
    flex: 1;
    align-items: center;
  }
</style>
