<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';
import type { AdmissionStage } from '@/features/admission-calls/admission-calls.types';
const props = defineProps<{
    show: boolean;
    applicantName: string;
    currentStageName?: string;
    destinations: AdmissionStage[];
    loading?: boolean;
    error?: string;
}>();
const emit = defineEmits<{ 'update:show': [value: boolean]; confirmar: [destinationId: string, observation: string] }>();
const destinationId = ref<string | null>(null);
const observation = ref('');
const canSave = computed(() => !props.loading && destinationId.value !== null &&
    props.destinations.some(item => item.id === destinationId.value));
watch(() => props.show, show => {
    if (show) { destinationId.value = null; observation.value = ''; }
}, { immediate: true });
function confirmar(): void {
    if (!canSave.value || destinationId.value === null) return;
    emit('confirmar', destinationId.value, observation.value.trim());
}
</script>
<template>
    <HeinrichModal
        :show="props.show"
        title="Cambiar etapa"
        subtitle="Selecciona la etapa a la que deseas mover al postulante."
        primary-text="Cambiar etapa"
        primary-icon="mdi-swap-horizontal"
        persistent
        :loading="loading"
        :primary-disabled="!canSave"
        @update:show="emit('update:show', $event)"
        @confirm="confirmar"
        ><p><b>Postulante:</b> {{ applicantName }}<br /><b>Etapa actual:</b> {{ currentStageName }}</p>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert
        ><v-select v-model="destinationId" :items="destinations" item-title="nombre" item-value="id" label="Etapa destino *" :disabled="loading" /><v-textarea
            v-model="observation"
            label="Observación"
            rows="2"
            auto-grow
            :disabled="loading"
    /></HeinrichModal>
</template>
