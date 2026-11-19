<script setup lang="ts">
import UiParentCard from './UiParentCard.vue';
defineProps<{ title?: string }>();
</script>
<template><UiParentCard :title="title" content-padding="none" variant="outlined" elevation="0"><slot /></UiParentCard></template>
