<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    loading?: boolean;
}>(), { loading: false });
</script>
<template>
    <v-card variant="outlined" class="h-100">
        <v-card-text>
            <div class="d-flex align-center justify-space-between ga-3">
                <div class="flex-grow-1">
                    <div class="text-caption">{{ title }}</div>
                    <v-skeleton-loader v-if="loading" type="heading" class="mt-1" />
                    <div v-else class="text-h5">{{ value }}</div>
                    <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">{{ subtitle }}</div>
                </div>
                <v-icon v-if="icon" :icon="icon" />
            </div>
        </v-card-text>
    </v-card>
</template>
