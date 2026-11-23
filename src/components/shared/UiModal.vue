<script setup lang="ts">
withDefaults(defineProps<{
    show: boolean;
    loading?: boolean;
    title?: string;
    subtitle?: string;
    hideClose?: boolean;
    hideTopClose?: boolean;
    hideFooterClose?: boolean;
    closeText?: string;
    size?: number;
    height?: number | string;
    persistent?: boolean;
    scrollable?: boolean;
}>(), {
    size: 800,
    persistent: false,
    scrollable: true,
    hideClose: false,
    hideTopClose: false,
    hideFooterClose: false,
    closeText: 'Cerrar'
});

const emit = defineEmits<{ 'update:show': [value: boolean] }>();
const closeDialog = () => emit('update:show', false);
</script>

<template>
    <v-dialog
        :model-value="show"
        :height="height"
        :width="size"
        :scrollable="scrollable"
        :persistent="persistent"
        @update:model-value="closeDialog"
    >
        <v-card>
            <v-card-text class="d-flex align-center" style="overflow-y: visible">
                <div>
                    <v-card-title v-if="title" class="text-h5 pl-0 text-wrap" :class="[subtitle ? 'pb-0' : '']">
                        {{ title }}
                    </v-card-title>
                    <v-card-subtitle v-if="subtitle" class="pl-0 pb-2 text-wrap">{{ subtitle }}</v-card-subtitle>
                    <slot v-if="!loading" name="sub-title" />
                </div>
                <v-spacer />
                <v-btn v-if="!hideClose && !hideTopClose" icon variant="flat" aria-label="Cerrar modal" @click="closeDialog">
                    <v-icon size="small">mdi-close</v-icon>
                </v-btn>
            </v-card-text>
            <v-progress-linear v-if="loading" :indeterminate="true" height="3" color="primary" />
            <v-divider />
            <v-card-text><slot /></v-card-text>
            <v-card-actions>
                <slot v-if="!loading" name="footer-actions-left" />
                <v-spacer />
                <slot v-if="!loading" name="footer-actions" />
                <v-btn v-if="!hideClose && !hideFooterClose" color="primary" @click="closeDialog">{{ closeText }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
