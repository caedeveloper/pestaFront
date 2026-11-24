<script setup lang="ts">
import HeinrichFilterCard from '@/components/heinrich/filters/HeinrichFilterCard.vue';
import { defineFilters, type FilterValues } from '@/components/heinrich/filters/filter.types';
import useAdmissionCallsService from '@/features/admission-calls/admission-calls.services';
import type { BuscarApplicantApplicationsRequest } from '../applicant-applications.types';
const callsService = useAdmissionCallsService();
const emit = defineEmits<{ buscar: [filters: BuscarApplicantApplicationsRequest] }>();
const model = defineFilters({
    search: { type: 'text', label: 'Buscar por postulante, tutor o documento', defaultValue: '', cols: 12, md: 5 },
    convocatoriaId: {
        type: 'select', label: 'Convocatoria', itemTitle: 'nombre', itemValue: 'codigo', cols: 12, md: 4,
        loadOptions: () => callsService.obtenerAdmissionCallCatalog()
    },
    stageId: {
        type: 'select', label: 'Etapa', dependsOn: ['convocatoriaId'], itemTitle: 'nombre', itemValue: 'id', cols: 12, md: 3,
        loadOptions: async filters => typeof filters.convocatoriaId === 'string'
            ? callsService.obtenerStages(filters.convocatoriaId) : []
    }
});
function buscar(filters: FilterValues): void {
    emit('buscar', {
        search: typeof filters.search === 'string' ? filters.search : undefined,
        convocatoriaId: typeof filters.convocatoriaId === 'string' ? filters.convocatoriaId : undefined,
        stageId: typeof filters.stageId === 'string' ? filters.stageId : undefined
    });
}
</script>
<template>
    <HeinrichFilterCard :model="model" @search="buscar" @reset="buscar" />
</template>
