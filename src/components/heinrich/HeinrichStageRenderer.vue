<script setup lang="ts">
import { computed } from 'vue';
import HeinrichStageRendererItems from './HeinrichStageRendererItems.vue';
import type { AdmissionContentItem, AdmissionStage } from '@/features/admission-calls/admission-calls.types';
import { esAdmissionSection } from '@/features/admission-calls/admission-calls.helpers';
import type { ApplicantActivityResponse } from '@/features/applicant-applications/applicant-applications.types';
const props = withDefaults(defineProps<{ stage: AdmissionStage; postulanteId: number; data: Record<string, ApplicantActivityResponse>; mode?: 'editable' | 'readonly' }>(), { mode: 'editable' });
const emit = defineEmits<{ changed: [] }>();
const items = computed(() => props.stage.contenido || []);
const hasEditableActions = computed(() => props.mode === 'editable' && items.value.some(function inspect(item: AdmissionContentItem): boolean { return !esAdmissionSection(item) || item.contenido.some(inspect); }));
defineExpose({ hasEditableActions });
</script>
<template><HeinrichStageRendererItems :items="items" :responses="data" :mode="mode" :postulante-id="postulanteId" @changed="emit('changed')" /></template>
