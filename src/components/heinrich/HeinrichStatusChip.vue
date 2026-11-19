<script setup lang="ts">
const props = withDefaults(defineProps<{ status: string; size?: 'x-small' | 'small' | 'default' }>(), { size: 'x-small' });
// BOR y CER replican UiChipEstado de WebFront. Las demás equivalencias siguen
// sus variantes semánticas ya usadas para procesos activos, pendientes y finalizados.
const colors: Record<string, string> = { Borrador: 'muted', Programada: 'warning', Abierta: 'success', Cerrada: 'secondary', Finalizada: 'success' };
</script>
<template><v-chip variant="flat" :size="size" :color="colors[status] || 'muted'">{{ status }}</v-chip></template>
