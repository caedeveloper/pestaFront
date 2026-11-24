<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiAddCard from '@/components/shared/UiAddCard.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import useApplicantApplicationsService from '@/features/applicant-applications/applicant-applications.services';
import type { ApplicantApplicationDetail } from '@/features/applicant-applications/applicant-applications.types';
import { obtenerEffectiveStageGuardianPermissions } from '@/features/admission-calls/admission-calls.helpers';
import { etiqueta, iniciales, nombreCompleto, registroAsignadoA } from '../postulantes.helpers';
import { relacionesTutor } from '../postulantes.catalogos';
import type { TutorEntidadId } from '../postulantes.types';

const route = useRoute(); const router = useRouter(); const store = useRegistroPostulanteStore(); const auth = useAuthStore();
const applicationsService = useApplicantApplicationsService(); const detail = ref<ApplicantApplicationDetail>();
const postulanteId = computed(() => Number(route.params.postulanteId));
const registro = computed(() => store.registros.find(item => item.postulanteId === postulanteId.value));
const admission = computed(() => detail.value?.application);
const convocatoria = computed(() => detail.value?.convocatoria);
const stage = computed(() => convocatoria.value?.etapas.find(item => item.id === admission.value?.etapaActualId));
const permissions = computed(() => obtenerEffectiveStageGuardianPermissions(stage.value));
const nombre = computed(() => registro.value ? nombreCompleto(registro.value.postulante) : 'Postulante');
const avance = computed(() => registro.value ? store.avanceDeRegistro(registro.value, 'postulante') : { completas: 0, total: 0, porcentaje: 0 });
const isResponsibleTutor = computed(() => !auth.user?.tutorId || registro.value?.tutorPrincipalId === auth.user.tutorId);
const tutores = computed(() => {
    const current = registro.value;
    if (!current) return [];
    return [
        { entidad: 'tutor-principal' as const, id: current.tutorPrincipalId, tutor: current.tutorPrincipal },
        { entidad: 'tutor-segundo' as const, id: current.tutorSegundoId, tutor: current.tutorSegundo }
    ].filter(({ tutor }) => Boolean(tutor.nombres)).map((item) => ({ ...item, avance: store.avanceDeRegistro(current, item.entidad) }));
});
onMounted(async () => {
    await store.cargarRegistro(); const current = registro.value;
    detail.value = await applicationsService.obtenerApplicantApplicationDetail(postulanteId.value);
    if (!current || !registroAsignadoA(current, auth.user?.tutorId ?? null, auth.user?.username ?? '')) router.replace({ name: 'postulantes' }); else store.seleccionarPostulante(current.postulanteId);
});
function editarPostulante() { if (registro.value) router.push({ name: 'postulante-registro', params: { postulanteId: registro.value.postulanteId }, query: { from: 'datos' } }); }
function editarTutor(entidad: TutorEntidadId, tutorId: number) { if (registro.value) router.push({ name: 'postulante-tutor-registro', params: { postulanteId: registro.value.postulanteId, tutorId }, query: { from: 'datos' } }); }
function puedeEditarTutor(tutorId: number) { return permissions.value.canEditOwnData && (isResponsibleTutor.value || !auth.user?.tutorId || auth.user.tutorId === tutorId); }
function agregarTutor() { if (permissions.value.canAddGuardians && registro.value) router.push({ name: 'postulante-tutor-registro', params: { postulanteId: registro.value.postulanteId, tutorId: registro.value.tutorSegundoId }, query: { operation: 'add', from: 'datos' } }); }
</script>
<template>
    <section v-if="registro" aria-labelledby="datos-postulacion">
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'postulantes' })">Volver a mis postulaciones</v-btn>
        <HeinrichHeroBanner id="datos-postulacion" title="Datos de la postulaciÃ³n" :subtitle="`${nombre} Â· ${convocatoria?.nombre || 'Sin convocatoria'}`" />
        <UiParentCard title="Datos del postulante" icon="mdi-account-outline" class="mb-6"><v-card variant="outlined" class="data-card" role="button" tabindex="0" @click="editarPostulante" @keydown.enter="editarPostulante"><v-card-item><template #prepend><v-avatar color="lightprimary"><v-icon color="primary">mdi-account-outline</v-icon></v-avatar></template><v-card-title>InformaciÃ³n de {{ registro.postulante.nombres.split(' ')[0] }}</v-card-title><v-card-subtitle>{{ avance.completas }} de {{ avance.total }} secciones completas</v-card-subtitle><template #append><v-chip color="primary" size="small" variant="tonal">{{ avance.porcentaje }}%</v-chip></template></v-card-item><v-card-actions class="justify-end px-4 pb-4"><v-btn color="primary" variant="text" append-icon="mdi-chevron-right" @click.stop="editarPostulante">{{ permissions.canEditApplicant ? 'Editar informaciÃ³n' : 'Ver informaciÃ³n' }}</v-btn></v-card-actions></v-card></UiParentCard>
        <UiParentCard title="Tutores vinculados" icon="mdi-account-group-outline" class="mb-6"><v-card v-for="item in tutores" :key="item.entidad" variant="outlined" class="data-card mb-3" role="button" tabindex="0" @click="editarTutor(item.entidad, item.id)" @keydown.enter="editarTutor(item.entidad, item.id)"><v-card-item><template #prepend><v-avatar color="lightprimary"><span class="text-primary font-weight-bold">{{ iniciales(item.tutor) }}</span></v-avatar></template><v-card-title>{{ nombreCompleto(item.tutor) }}</v-card-title><v-card-subtitle>{{ etiqueta(relacionesTutor, item.tutor.relacionTutorId) }} Â· {{ item.entidad === 'tutor-principal' ? 'Tutor responsable' : 'Tutor vinculado' }} Â· {{ item.avance.completas }} de {{ item.avance.total }} secciones completas</v-card-subtitle><template #append><v-chip color="primary" size="small" variant="tonal">{{ item.avance.porcentaje }}%</v-chip></template></v-card-item><v-card-actions class="justify-end px-4 pb-4"><v-btn color="primary" variant="text" append-icon="mdi-chevron-right" @click.stop="editarTutor(item.entidad, item.id)">{{ puedeEditarTutor(item.id) ? 'Editar informaciÃ³n' : 'Ver informaciÃ³n' }}</v-btn></v-card-actions></v-card><UiAddCard v-if="permissions.canAddGuardians && isResponsibleTutor" title="Agregar tutor" @click="agregarTutor" /></UiParentCard>
    </section>
</template>
<style scoped>.data-card { cursor: pointer; }</style>

