<script setup lang="ts">
import { ref } from 'vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';
import type { AdmissionStage } from '@/features/admission-calls/admission-calls.types';
const props = defineProps<{ show: boolean; applicantName: string; currentStageName?: string; destinations: AdmissionStage[]; loading?: boolean; error?: string }>();
const emit = defineEmits<{ 'update:show': [value: boolean]; confirmar: [destinationId: string, observation: string] }>();
const destinationId = ref(''); const observation = ref('');
function confirmar(): void { if (destinationId.value) emit('confirmar', destinationId.value, observation.value); }
</script>
<template><HeinrichModal :show="props.show" title="Cambiar etapa" subtitle="Selecciona la etapa a la que deseas mover al postulante." persistent :loading="loading" :primary-disabled="!destinationId" @update:show="emit('update:show', $event)" @confirm="confirmar"><p><b>Postulante:</b> {{ applicantName }}<br><b>Etapa actual:</b> {{ currentStageName }}</p><v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert><v-select v-model="destinationId" :items="destinations" item-title="nombre" item-value="id" label="Etapa destino *" /><v-textarea v-model="observation" label="Observación" rows="2" auto-grow /></HeinrichModal></template>
