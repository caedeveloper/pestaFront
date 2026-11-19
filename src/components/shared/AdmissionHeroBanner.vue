<script setup lang="ts">
defineProps<{
    title: string;
    subtitle?: string;
}>();
</script>

<template>
    <v-card class="bg-lightprimary elevation-0 rounded-md mb-8">
        <div class="px-8 py-8 py-lg-0">
            <div class="d-flex justify-space-between">
                <div class="d-flex py-0 align-center">
                    <div>
                        <h1 class="admission-page-title mb-2">{{ title }}</h1>
                        <p v-if="subtitle" class="text-medium-emphasis admission-banner-subtitle mb-0">{{ subtitle }}</p>
                    </div>
                </div>
                <div class="d-none py-0 d-lg-block overflow-hidden" aria-hidden="true">
                    <div class="mb-n16 mt-3"><img src="@/assets/images/breadcrumb/logo-heinrich.svg" alt="" height="170" /></div>
                </div>
            </div>
        </div>
    </v-card>
</template>
