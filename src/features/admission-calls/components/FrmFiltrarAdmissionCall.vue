<script setup lang="ts">
import HeinrichFilterCard from
    '@/components/heinrich/filters/HeinrichFilterCard.vue';

import {
    defineFilters,
    type FilterValues
} from '@/components/heinrich/filters/filter.types';

import useAdmissionCallsService from '../admission-calls.services';

import type {
    BuscarAdmissionCallsRequest
} from '../admission-calls.types';

const service = useAdmissionCallsService();

const emit = defineEmits<{
    buscar: [request: BuscarAdmissionCallsRequest];
}>();

const filterModel = defineFilters({
    nombre: {
        type: 'text',
        label: 'Nombre de convocatoria',
        defaultValue: '',
        cols: 12,
        md: 6,
        lg: 3
    },

    anio: {
        type: 'select',
        label: 'Año académico',
        cols: 12,
        md: 6,
        lg: 3,
        loadOptions: async () => {
            const items = await service.obtenerAcademicYears();

            return items.map(item => item.codigo);
        }
    },

    grado: {
        type: 'select',
        label: 'Nivel / grado',
        cols: 12,
        md: 6,
        lg: 3,
        loadOptions: async () => {
            const items = await service.obtenerGrades();

            return items.map(item => item.codigo);
        }
    },

    estado: {
        type: 'select',
        label: 'Estado',
        cols: 12,
        md: 6,
        lg: 3,
        loadOptions: async () => {
            const items = await service.obtenerStatuses();

            return items.map(item => item.codigo);
        }
    }
});

function buscarAdmissionCalls(filters: FilterValues): void {
    const request: BuscarAdmissionCallsRequest = {
        nombre: typeof filters.nombre === 'string'
            ? filters.nombre.trim() || undefined
            : undefined,

        anio: typeof filters.anio === 'string'
            ? filters.anio || undefined
            : undefined,

        grado: typeof filters.grado === 'string'
            ? filters.grado || undefined
            : undefined,

        estado: typeof filters.estado === 'string'
            ? filters.estado || undefined
            : undefined
    };

    emit('buscar', request);
}
</script>

<template>
    <HeinrichFilterCard
        :model="filterModel"
        @search="buscarAdmissionCalls"
        @reset="buscarAdmissionCalls"
    />
</template>