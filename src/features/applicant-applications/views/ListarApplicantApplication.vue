<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EyeIcon } from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichDataTable from '@/components/heinrich/heinrich-data-table/HeinrichDataTable.vue';
import useDataTableFetch from '@/components/heinrich/heinrich-data-table/useDataTableFetch';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import useAdmissionCallsService from '@/features/admission-calls/admission-calls.services';
import type { AdmissionCall } from '@/features/admission-calls/admission-calls.types';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import FrmFiltrarApplicantApplication from '../components/FrmFiltrarApplicantApplication.vue';
import { APPLICANT_APPLICATION_COLUMNS, APPLICANT_APPLICATION_TABLE_DEFAULTS } from '../applicant-applications.constants';
import useApplicantApplicationsService from '../applicant-applications.services';
import type { ApplicantApplicationListItem, BuscarApplicantApplicationsRequest } from '../applicant-applications.types';
const router = useRouter(); const registroStore = useRegistroPostulanteStore(); const service = useApplicantApplicationsService(); const callsService = useAdmissionCallsService(); const admissionCalls = ref<AdmissionCall[]>([]); const ready = ref(false);
const { state, query, buscar, errorMessage, limpiarError } = useDataTableFetch<ApplicantApplicationListItem, BuscarApplicantApplicationsRequest>((filters, pagination) => service.buscarApplicantApplications(registroStore.registros, filters, pagination), { initialFilters: {}, lazy: true });
const initialCount = computed(() => state.value.rows.filter(item => item.esRegistroInicial).length);
async function cargar(): Promise<void> { await registroStore.cargarRegistro(); const response = await callsService.buscarAdmissionCalls({}, { page: 1, itemsPerPage: 100 }); admissionCalls.value = (await Promise.all(response.items.map(item => callsService.obtenerAdmissionCall(item.id)))).filter((item): item is AdmissionCall => Boolean(item)); const current = admissionCalls.value.find(item => item.etapas.length) ?? admissionCalls.value[0]; if (current) await service.asegurarApplicantApplications(registroStore.registros.map(item => item.postulanteId), current.id, current.etapas); ready.value = true; buscar({}); }
onMounted(() => { void cargar(); });
</script>
<template><section><HeinrichHeroBanner title="Postulantes" subtitle="Consulta y administra los postulantes registrados en los procesos de admisión." /><v-row class="mb-2"><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text><div class="text-caption">Total de postulantes registrados</div><div class="text-h5">{{ state.totalItems }}</div></v-card-text></v-card></v-col><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text><div class="text-caption">Postulantes en registro inicial</div><div class="text-h5">{{ initialCount }}</div></v-card-text></v-card></v-col><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text><div class="text-caption">Postulantes en otras etapas</div><div class="text-h5">{{ state.totalItems - initialCount }}</div></v-card-text></v-card></v-col></v-row><FrmFiltrarApplicantApplication class="mb-6" :admission-calls="admissionCalls" :loading="!ready || state.loading" @buscar="buscar" /><v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6" closable @click:close="limpiarError">{{ errorMessage }}</v-alert><UiParentCard title="Listado de postulantes" icon="mdi-account-group-outline"><HeinrichDataTable v-model:query="query" :columns="APPLICANT_APPLICATION_COLUMNS" :defaults="APPLICANT_APPLICATION_TABLE_DEFAULTS" :state="state" row-key="id"><template #item-id="{ item }"><v-btn size="small" variant="tonal" color="default" :prepend-icon="EyeIcon" @click="router.push({ name: 'admision-postulante-detalle', params: { postulanteId: item.id } })">Ver detalle</v-btn></template></HeinrichDataTable></UiParentCard></section></template>
