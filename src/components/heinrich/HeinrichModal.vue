<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        show: boolean;
        title: string;
        subtitle?: string;
        width?: number | string;
        persistent?: boolean;
        loading?: boolean;
        primaryText?: string;
        primaryIcon?: string;
        primaryColor?: 'primary' | 'error';
        primaryDisabled?: boolean;
        cancelText?: string;
        showPrimary?: boolean;
        showCancel?: boolean;
        showClose?: boolean;
        showActions?: boolean;
    }>(),
    {
        width: 800,
        persistent: false,
        loading: false,
        primaryText: 'Guardar',
        primaryIcon: 'mdi-content-save',
        primaryColor: 'primary',
        primaryDisabled: false,
        cancelText: 'Cancelar',
        showPrimary: true,
        showCancel: true,
        showClose: true,
        showActions: true
    }
);

const emit = defineEmits<{
    'update:show': [value: boolean];
    confirm: [];
    cancel: [];
}>();

function cancelar(): void {
    if (props.loading) return;
    emit('update:show', false);
    emit('cancel');
}

function confirmar(): void {
    if (props.loading || props.primaryDisabled) return;
    emit('confirm');
}

function actualizarShow(value: boolean): void {
    if (!value) cancelar();
}
</script>

<template>
    <v-dialog
        :model-value="show"
        :width="width"
        max-width="calc(100% - 48px)"
        :persistent="persistent || loading"
        :aria-label="title"
        scrollable
        @update:model-value="actualizarShow"
    >
        <v-card class="heinrich-modal">
            <div class="heinrich-modal-header">
                <div class="heinrich-modal-heading">
                    <v-card-title class="text-h5 pa-0 text-wrap">{{ title }}</v-card-title>
                    <v-card-subtitle v-if="subtitle" class="pa-0 mt-1 text-wrap">{{ subtitle }}</v-card-subtitle>
                </div>
                <v-btn
                    v-if="showClose"
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    aria-label="Cerrar modal"
                    :disabled="loading"
                    @click="cancelar"
                />
            </div>
            <v-divider />
            <v-card-text class="heinrich-modal-body"><slot /></v-card-text>
            <template v-if="showActions">
                <v-divider />
                <v-card-actions class="heinrich-modal-footer">
                    <slot name="footer-left" />
                    <v-spacer />
                    <slot name="actions" :confirm="confirmar" :cancel="cancelar" :loading="loading">
                        <v-btn v-if="showCancel" variant="text" :disabled="loading" @click="cancelar">{{ cancelText }}</v-btn>
                        <v-btn
                            v-if="showPrimary"
                            :color="primaryColor"
                            variant="flat"
                            :prepend-icon="primaryIcon || undefined"
                            :disabled="primaryDisabled || loading"
                            :loading="loading"
                            @click="confirmar"
                            >{{ primaryText }}</v-btn
                        >
                    </slot>
                </v-card-actions>
            </template>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.heinrich-modal {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 48px);
    max-height: calc(100dvh - 48px);
    overflow: hidden;
}
.heinrich-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    gap: 16px;
    padding: 16px 24px;
}
.heinrich-modal-heading {
    min-width: 0;
}
.heinrich-modal-body {
    flex: 0 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 24px;
}
.heinrich-modal-footer {
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 24px;
}
@media (max-width: 600px) {
    .heinrich-modal-header,
    .heinrich-modal-body,
    .heinrich-modal-footer {
        padding-left: 16px;
        padding-right: 16px;
    }
}
</style>
