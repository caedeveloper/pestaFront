<script setup lang="ts">
withDefaults(defineProps<{
    show: boolean; title?: string; subtitle?: string; loading?: boolean; size?: number;
    persistent?: boolean; scrollable?: boolean; hideClose?: boolean; closeText?: string;
}>(), { size: 800, scrollable: true, persistent: false, hideClose: false, closeText: 'Cerrar' });

const emit = defineEmits<{ 'update:show': [value: boolean] }>();
const close = () => emit('update:show', false);
</script>

<template>
    <v-dialog :model-value="show" :width="size" :scrollable="scrollable" :persistent="persistent" @update:model-value="close">
        <v-card class="ui-modal-card">
            <v-card-title v-if="title" class="d-flex align-center text-wrap">
                <span>{{ title }}</span><v-spacer />
                <v-btn v-if="!hideClose" icon variant="text" aria-label="Cerrar modal" @click="close"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
            <v-progress-linear v-if="loading" color="primary" indeterminate />
            <v-divider v-if="title || subtitle" />
            <v-card-text class="ui-modal-card__body"><slot /></v-card-text>
            <v-card-actions v-if="$slots['footer-actions'] || !hideClose" class="ui-modal-card__actions">
                <slot name="footer-actions-left" /><v-spacer /><slot name="footer-actions" />
                <v-btn v-if="!hideClose" color="primary" @click="close">{{ closeText }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.ui-modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 48px);
}

.ui-modal-card__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}

.ui-modal-card__actions {
    flex: 0 0 auto;
}
</style>
