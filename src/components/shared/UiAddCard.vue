<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    icon?: string;
}>(), {
    icon: 'mdi-plus'
});

const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <v-card class="ui-add-card" role="button" tabindex="0" @click="emit('click')" @keydown.enter="emit('click')">
        <v-card-text class="d-flex align-center justify-center ga-3 py-8">
            <v-icon color="grey-darken-1" size="24">{{ icon }}</v-icon>
            <span class="font-weight-medium" color="grey-darken-1">{{ title }}</span>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.ui-add-card {
    background-color: rgb(var(--v-theme-grey100));
    background-image:
        repeating-linear-gradient(to right, #858585 0 12px, transparent 12px 20px),
        repeating-linear-gradient(to bottom, #858585 0 12px, transparent 12px 20px),
        repeating-linear-gradient(to right, #858585 0 12px, transparent 12px 20px),
        repeating-linear-gradient(to bottom, #858585 0 12px, transparent 12px 20px);
    background-position: top, right, bottom, left;
    background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
    background-size: auto 1px, 1px auto, auto 1px, 1px auto;
    border: 0 !important;
    box-shadow: none !important;
}
</style>
