<script setup lang="ts">
import { computed } from 'vue';
import HeinrichFilterCard from '@/components/heinrich/filters/HeinrichFilterCard.vue';
import { defineFilters, type FilterValues } from '@/components/heinrich/filters/filter.types';
import type { AdmissionCall } from '@/features/admission-calls/admission-calls.types';
const props = defineProps<{ admissionCalls: AdmissionCall[]; loading?: boolean }>();
const emit = defineEmits<{ buscar: [filters: FilterValues] }>();
const model = computed(() =>
    defineFilters({
        search: { type: 'text', label: 'Buscar por postulante, tutor o documento', defaultValue: '', cols: 12, md: 5 },
        convocatoriaId: {
            type: 'select',
            label: 'Convocatoria',
            items: props.admissionCalls,
            itemTitle: 'nombre',
            itemValue: 'id',
            cols: 12,
            md: 4
        },
        stageId: {
            type: 'select',
            label: 'Etapa',
            dependsOn: ['convocatoriaId'],
            itemTitle: 'nombre',
            itemValue: 'id',
            cols: 12,
            md: 3,
            loadOptions: async (filters) => props.admissionCalls.find((item) => item.id === filters.convocatoriaId)?.etapas ?? []
        }
    })
);
</script>
<template>
    <HeinrichFilterCard :model="model" :loading="loading" @search="emit('buscar', $event)" @reset="emit('buscar', $event)" />
</template>
