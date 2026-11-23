<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiAddCard from '@/components/shared/UiAddCard.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { convocatorias } from '@/features/admision/convocatorias.store';
import { admissionFor, ensureApplicantAdmissions } from '@/features/admision/admissionOperational.store';
import { effectiveStageTutorPermissions } from '@/features/admision/stageTutorPermissions';
import { etiqueta, iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
import { relacionesTutor } from '../postulantes.catalogos';
import type { TutorEntidadId } from '../postulantes.types';

const route = useRoute(); const router = useRouter(); const store = useRegistroPostulanteStore(); const auth = useAuthStore();
const postulanteId = computed(() => Number(route.params.postulanteId));
const registro = computed(() => store.registros.find(item => item.postulanteId === postulanteId.value));
const admission = computed(() => admissionFor(postulanteId.value));
const convocatoria = computed(() => convocatorias.value.find(item => item.id === admission.value?.convocatoriaId));
const stage = computed(() => convocatoria.value?.etapas.find(item => item.id === admission.value?.etapaActualId));
const permissions = computed(() => effectiveStageTutorPermissions(stage.value));
const nombre = computed(() => registro.value ? nombreCompleto(registro.value.postulante) : 'Postulante');
const avance = computed(() => registro.value ? store.avanceDeRegistro(registro.value, 'postulante') : { completas: 0, total: 0, porcentaje: 0 });
const isResponsibleTutor = computed(() => !auth.user?.tutorId || registro.value?.tutorPrincipalId === auth.user.tutorId);
const tutores = computed(() => !registro.value ? [] : [
    { entidad: 'tutor-principal' as const, id: registro.value.tutorPrincipalId, tutor: registro.value.tutorPrincipal },
    { entidad: 'tutor-segundo' as const, id: registro.value.tutorSegundoId, tutor: registro.value.tutorSegundo }
].filter(({ tutor }) => Boolean(tutor.nombres)));
onMounted(async () => {
    await store.cargarRegistro(); const current = registro.value; const call = convocatorias.value.find(item => item.etapas.length) || convocatorias.value[0];
    if (call) ensureApplicantAdmissions(store.registros, call.id, call.etapas);
    if (!current || !registroAsignadoA(current, auth.user?.tutorId ?? null, auth.user?.username ?? '')) router.replace({ name: 'postulantes' }); else store.seleccionarPostulante(current.postulanteId);
});
function editarPostulante() { if (registro.value) router.push({ name: 'postulante-registro', params: { postulanteId: registro.value.postulanteId } }); }
function editarTutor(entidad: TutorEntidadId, tutorId: number) { if (registro.value) router.push({ name: 'postulante-tutor-registro', params: { postulanteId: registro.value.postulanteId, tutorId } }); }
function agregarTutor() { if (permissions.value.canAddTutors && registro.value) router.push({ name: 'postulante-tutor-registro', params: { postulanteId: registro.value.postulanteId, tutorId: registro.value.tutorSegundoId }, query: { operation: 'add' } }); }
</script>
<template>
    <section v-if="registro" aria-labelledby="datos-postulacion">
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'postulantes' })">Volver a mis postulaciones</v-btn>
        <HeinrichHeroBanner id="datos-postulacion" title="Datos de la postulación" :subtitle="`${nombre} · ${convocatoria?.nombre || 'Sin convocatoria'}`" />
        <UiParentCard title="Datos del postulante" icon="mdi-account-outline" class="mb-6"><v-card variant="outlined" class="data-card" role="button" tabindex="0" @click="editarPostulante" @keydown.enter="editarPostulante"><v-card-item><template #prepend><v-avatar color="lightprimary"><v-icon color="primary">mdi-account-outline</v-icon></v-avatar></template><v-card-title>Información de {{ registro.postulante.nombres.split(' ')[0] }}</v-card-title><v-card-subtitle>{{ avance.completas }} de {{ avance.total }} secciones completas</v-card-subtitle><template #append><v-chip color="primary" size="small" variant="tonal">{{ avance.porcentaje }}%</v-chip></template></v-card-item><v-card-actions class="justify-end px-4 pb-4"><v-btn color="primary" variant="text" append-icon="mdi-chevron-right" @click.stop="editarPostulante">{{ permissions.canEditApplicant ? 'Editar información' : 'Ver información' }}</v-btn></v-card-actions></v-card></UiParentCard>
        <UiParentCard title="Tutores vinculados" icon="mdi-account-group-outline" class="mb-6"><v-card v-for="item in tutores" :key="item.entidad" variant="outlined" class="data-card mb-3" role="button" tabindex="0" @click="editarTutor(item.entidad, item.id)" @keydown.enter="editarTutor(item.entidad, item.id)"><v-card-item><template #prepend><v-avatar color="lightprimary"><span class="text-primary font-weight-bold">{{ iniciales(item.tutor) }}</span></v-avatar></template><v-card-title>{{ nombreCompleto(item.tutor) }}</v-card-title><v-card-subtitle>{{ etiqueta(relacionesTutor, item.tutor.relacionTutorId) }} · {{ item.entidad === 'tutor-principal' ? 'Tutor responsable' : 'Tutor vinculado' }}</v-card-subtitle><template #append><v-icon>mdi-chevron-right</v-icon></template></v-card-item></v-card><UiAddCard v-if="permissions.canAddTutors && isResponsibleTutor" title="Agregar tutor" @click="agregarTutor" /></UiParentCard>
    </section>
</template>
<style scoped>.data-card { cursor: pointer; }</style>
