<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { convocatorias } from '@/features/convocatorias/convocatorias.services';
import { admissionFor, ensureApplicantAdmissions } from '@/features/solicitudes-postulantes/solicitudes-postulantes.services';
import { effectiveStageTutorPermissions } from '@/features/convocatorias/convocatorias.helpers';
import FormularioPostulante from '../components/FormularioPostulante.vue';
import FormularioTutor from '../components/FormularioTutor.vue';
import { nombreCompleto, registroAsignadoA } from '../postulantes.helpers';

const route = useRoute(); const router = useRouter(); const store = useRegistroPostulanteStore(); const auth = useAuthStore(); const saved = ref(false);
const postulanteId = computed(() => Number(route.params.postulanteId));
const registro = computed(() => store.registros.find(item => item.postulanteId === postulanteId.value));
const admission = computed(() => admissionFor(postulanteId.value));
const convocatoria = computed(() => convocatorias.value.find(item => item.id === admission.value?.convocatoriaId));
const stage = computed(() => convocatoria.value?.etapas.find(item => item.id === admission.value?.etapaActualId));
const permissions = computed(() => effectiveStageTutorPermissions(stage.value));
const ownEntity = computed<'tutor-principal' | 'tutor-segundo'>(() => registro.value?.tutorSegundoId === auth.user?.tutorId ? 'tutor-segundo' : 'tutor-principal');
const nombre = computed(() => registro.value ? nombreCompleto(registro.value.postulante) : 'Postulante');
onMounted(async () => { await store.cargarRegistro(); const current = registro.value; const call = convocatorias.value.find(item => item.etapas.length) || convocatorias.value[0]; if (call) ensureApplicantAdmissions(store.registros, call.id, call.etapas); if (!current || !registroAsignadoA(current, auth.user?.tutorId ?? null, auth.user?.username ?? '')) router.replace({ name: 'postulantes' }); else store.seleccionarPostulante(current.postulanteId); });
async function saveApplicant() { if (permissions.value.canEditApplicant) { await store.guardarRegistro(); saved.value = true; } }
async function saveTutor() { if (permissions.value.canEditOwnData) { await store.guardarRegistro(); saved.value = true; } }
</script>
<template>
    <section v-if="registro"><v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'postulante-datos', params: { postulanteId } })">Volver a datos de la postulación</v-btn><HeinrichHeroBanner title="Formularios de la postulación" :subtitle="`${nombre} · ${convocatoria?.nombre || 'Sin convocatoria'}`" />
        <UiParentCard title="Datos del postulante" icon="mdi-account-outline" class="mb-6"><template #action><v-chip v-if="!permissions.canEditApplicant" color="warning" size="small" variant="tonal">Solo lectura</v-chip></template><FormularioPostulante embedded :readonly="!permissions.canEditApplicant" /><template #footer-actions><v-btn v-if="permissions.canEditApplicant" color="primary" @click="saveApplicant">Guardar cambios</v-btn></template></UiParentCard>
        <UiParentCard title="Mis datos como tutor" icon="mdi-account-star-outline"><template #action><v-chip v-if="!permissions.canEditOwnData" color="warning" size="small" variant="tonal">Solo lectura</v-chip></template><FormularioTutor :entidad="ownEntity" embedded :readonly="!permissions.canEditOwnData" /><template #footer-actions><v-btn v-if="permissions.canEditOwnData" color="primary" @click="saveTutor">Guardar mis datos</v-btn></template></UiParentCard><v-snackbar v-model="saved" color="success">Cambios guardados localmente.</v-snackbar>
    </section>
</template>
