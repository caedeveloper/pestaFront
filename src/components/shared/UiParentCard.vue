<script setup lang="ts">
import { useSlots } from 'vue';

defineProps<{
    title?: string;
    subtitle?: string;
    icon?: string;
    loading?: boolean;
}>();

const slots = useSlots();
</script>

<template>
    <v-card elevation="10">
        <v-card-item class="py-4 px-6">
            <slot name="header">
                <div class="d-sm-flex align-center justify-space-between">
                    <v-card-title v-if="title" class="admission-title">
                        <v-icon v-if="icon" class="text-medium-emphasis me-2" size="20">{{ icon }}</v-icon>{{ title }}
                    </v-card-title>
                    <slot name="action" />
                </div>
                <v-card-subtitle v-if="subtitle" class="admission-card-subtitle">{{ subtitle }}</v-card-subtitle>
            </slot>
        </v-card-item>
        <v-progress-linear v-if="loading" indeterminate height="3" color="primary" />
        <v-divider />
        <v-card-text><slot /></v-card-text>
        <template v-if="slots.footer || slots['footer-actions']">
            <v-divider />
            <v-card-item class="py-4 px-6"><div class="d-sm-flex align-center justify-space-between"><slot name="footer" /><v-spacer v-if="!slots.footer || slots['footer-actions']" /><slot name="footer-actions" /></div></v-card-item>
        </template>
    </v-card>
</template>
