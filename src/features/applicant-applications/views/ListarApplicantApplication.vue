<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EyeIcon } from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichDataTable from '@/components/heinrich/heinrich-data-table/HeinrichDataTable.vue';
import useDataTableFetch from '@/components/heinrich/heinrich-data-table/useDataTableFetch';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichStatCard from '@/components/heinrich/HeinrichStatCard.vue';
import FrmFiltrarApplicantApplication from '../components/FrmFiltrarApplicantApplication.vue';
import { APPLICANT_APPLICATION_COLUMNS, APPLICANT_APPLICATION_TABLE_DEFAULTS } from '../applicant-applications.constants';
import useApplicantApplicationsService from '../applicant-applications.services';
import type { ApplicantApplicationListItem, ApplicantApplicationSummary, BuscarApplicantApplicationsRequest } from '../applicant-applications.types';

const router = useRouter();
const service = useApplicantApplicationsService();
const { state, query, buscar, recargar, errorMessage, limpiarError } =
    useDataTableFetch<ApplicantApplicationListItem, BuscarApplicantApplicationsRequest>(
        service.buscarApplicantApplications, { initialFilters: {} }
    );
const summary = ref<ApplicantApplicationSummary>({ totalPostulantes: 0, totalRegistroInicial: 0, totalOtrasEtapas: 0 });
const loadingSummary = ref(false);
const summaryError = ref('');
const summaryReady = ref(false);
const activeFilters = ref<BuscarApplicantApplicationsRequest>({});
let summaryRequestId = 0;

async function cargarSummary(filters: BuscarApplicantApplicationsRequest): Promise<void> {
    const requestId = ++summaryRequestId;
    loadingSummary.value = true;
    summaryError.value = '';
    summaryReady.value = false;
    try {
        const result = await service.obtenerApplicantApplicationSummary(filters);
        if (requestId !== summaryRequestId) return;
        summary.value = result;
        summaryReady.value = true;
    } catch {
        if (requestId === summaryRequestId) summaryError.value = 'No se pudieron cargar las estadísticas.';
    } finally {
        if (requestId === summaryRequestId) loadingSummary.value = false;
    }
}
function aplicarFiltros(filters: BuscarApplicantApplicationsRequest): void {
    activeFilters.value = { ...filters };
    buscar(filters);
    void cargarSummary(filters);
}
onMounted(() => { void cargarSummary({}); });
</script>

<template>
    <section>
        <HeinrichHeroBanner title="Postulantes" subtitle="Consulta y administra los postulantes registrados en los procesos de admisión." />
        <v-row v-if="summaryReady || loadingSummary" class="mb-2">
            <v-col cols="12" md="4"><HeinrichStatCard title="Total de postulantes registrados" :value="summary.totalPostulantes" :loading="loadingSummary" /></v-col>
            <v-col cols="12" md="4"><HeinrichStatCard title="Postulantes en registro inicial" :value="summary.totalRegistroInicial" :loading="loadingSummary" /></v-col>
            <v-col cols="12" md="4"><HeinrichStatCard title="Postulantes en otras etapas" :value="summary.totalOtrasEtapas" :loading="loadingSummary" /></v-col>
        </v-row>
        <v-alert v-if="summaryError" type="error" variant="tonal" class="mb-6">
            {{ summaryError }} <v-btn variant="text" @click="cargarSummary(activeFilters)">Reintentar</v-btn>
        </v-alert>
        <v-alert v-else-if="!summaryReady && !loadingSummary" type="info" variant="tonal" class="mb-6">Estadísticas no disponibles.</v-alert>
        <FrmFiltrarApplicantApplication class="mb-6" @buscar="aplicarFiltros" />
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6" closable @click:close="limpiarError">
            {{ errorMessage }} <v-btn variant="text" @click="recargar">Reintentar</v-btn>
        </v-alert>
        <UiParentCard title="Listado de postulantes" icon="mdi-account-group-outline">
            <HeinrichDataTable v-model:query="query" :columns="APPLICANT_APPLICATION_COLUMNS"
                :defaults="APPLICANT_APPLICATION_TABLE_DEFAULTS" :state="state" row-key="id">
                <template #item-id="{ item }">
                    <v-btn icon size="small" variant="flat" class="applicant-detail-action" aria-label="Ver detalle del postulante"
                        @click="router.push({ name: 'admision-postulante-detalle', params: { postulanteId: item.id } })">
                        <EyeIcon size="20" /><v-tooltip activator="parent">Ver detalle</v-tooltip>
                    </v-btn>
                </template>
            </HeinrichDataTable>
        </UiParentCard>
    </section>
</template>

<style scoped>
.applicant-detail-action { width: 32px; height: 28px; min-width: 32px; border-radius: 6px; background-color: rgb(var(--v-theme-surface-variant)); color: rgb(var(--v-theme-on-surface)); }
.applicant-detail-action:hover { background-color: rgba(var(--v-theme-primary), .12); }
</style>
