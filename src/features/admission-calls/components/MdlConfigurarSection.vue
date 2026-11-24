<script setup lang="ts">
import { ref } from 'vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';
import type { AdmissionSection } from '../admission-calls.types';

const props = defineProps<{ section: AdmissionSection }>();
const emit = defineEmits<{
    save: [section: AdmissionSection];
    close: [];
}>();

// El padre monta una instancia nueva cada vez que abre el modal.
const form = ref<AdmissionSection>(JSON.parse(JSON.stringify(props.section)));

function guardarSection(): void {
    const nombre = form.value.nombre.trim();
    if (!nombre) return;
    const result: AdmissionSection = JSON.parse(JSON.stringify(form.value));
    emit('save', { ...result, nombre });
}
</script>

<template>
    <HeinrichModal
        :show="true"
        title="Configurar sección"
        primary-text="Guardar sección"
        :primary-disabled="!form.nombre.trim()"
        persistent
        @confirm="guardarSection"
        @cancel="emit('close')"
    >
        <v-text-field v-model="form.nombre" label="Nombre de sección *" />
        <v-textarea v-model="form.descripcion" label="Descripción" rows="2" auto-grow />

    </HeinrichModal>
</template>
