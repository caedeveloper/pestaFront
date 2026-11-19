<script setup lang="ts">defineProps<{ title?: string }>();</script>
<template><v-card class="ui-child-card" variant="outlined"><v-card-item class="ui-child-card__header"><v-card-title class="text-headline-medium">{{ title }}</v-card-title></v-card-item><v-divider /><v-card-text class="ui-child-card__content"><slot /></v-card-text></v-card></template>
<style scoped>.ui-child-card__header, .ui-child-card__content { padding: 1.875rem 1.875rem 1.5rem; }</style>
