<script setup lang="ts">
import { computed } from 'vue';
import HeinrichStageRendererItems from './HeinrichStageRendererItems.vue';
import type { AdmissionStage } from '@/features/admision/convocatorias.mock';
import type { AdmissionActionResponse } from '@/features/admision/admissionOperational.store';
const props = withDefaults(defineProps<{ stage: AdmissionStage; postulanteId: number; data: Record<string, AdmissionActionResponse>; mode?: 'editable' | 'readonly' }>(), { mode: 'editable' });
const emit = defineEmits<{ changed: [] }>();
const items = computed(() => props.stage.contenido || []);
const hasEditableActions = computed(() => props.mode === 'editable' && items.value.some(function inspect(item): boolean { return item.tipo !== 'section' || (item.contenido || []).some(inspect); }));
defineExpose({ hasEditableActions });
</script>
<template><HeinrichStageRendererItems :items="items" :responses="data" :mode="mode" :postulante-id="postulanteId" @changed="emit('changed')" /></template>
