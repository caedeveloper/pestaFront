<script setup lang="ts">
import type { AdmissionAction, AdmissionContentItem, AdmissionSection } from '../convocatorias.mock';
defineProps<{ items: AdmissionContentItem[]; parentId?: string }>();
const emit = defineEmits<{ editSection: [section: AdmissionSection]; editAction: [action: AdmissionAction, parentId?: string]; remove: [id: string, parentId?: string]; move: [index: number, delta: number, parentId?: string]; addSection: [parentId?: string]; addAction: [parentId?: string] }>();
const isSection = (item: AdmissionContentItem): item is AdmissionSection => item.tipo === 'section';
const typeIcon = (type: AdmissionAction['tipo']) => ({ richText: 'mdi-text-box-outline', documentUpload: 'mdi-file-upload-outline', confirmation: 'mdi-check-decagram-outline' }[type]);
const typeLabel = (type: AdmissionAction['tipo']) => ({ richText: 'Texto enriquecido', documentUpload: 'Carga de documentos', confirmation: 'Confirmación' }[type]);
</script>
<template>
  <div class="stage-tree" :class="{ 'stage-tree--nested': parentId }">
    <template v-for="(item, index) in items" :key="item.id">
      <v-card v-if="isSection(item)" variant="outlined" class="mb-3 section-node">
        <v-card-text class="pb-2">
          <div class="d-flex align-start justify-space-between ga-2">
            <div class="d-flex ga-3"><v-icon color="primary" class="mt-1">mdi-folder-outline</v-icon><div><div class="font-weight-medium">{{ item.nombre }}</div><div v-if="item.descripcion" class="text-caption text-medium-emphasis">{{ item.descripcion }}</div></div></div>
            <div class="node-actions"><v-btn size="x-small" variant="text" icon="mdi-arrow-up" :disabled="index === 0" @click="emit('move', index, -1, parentId)" /><v-btn size="x-small" variant="text" icon="mdi-arrow-down" :disabled="index === items.length - 1" @click="emit('move', index, 1, parentId)" /><v-btn size="x-small" variant="text" icon="mdi-pencil" @click="emit('editSection', item)" /><v-btn size="x-small" variant="text" color="error" icon="mdi-delete-outline" @click="emit('remove', item.id, parentId)" /></div>
          </div>
          <StageContentTree :items="item.contenido || []" :parent-id="item.id" @edit-section="emit('editSection', $event)" @edit-action="(action, parent) => emit('editAction', action, parent)" @remove="(id, parent) => emit('remove', id, parent)" @move="(i, delta, parent) => emit('move', i, delta, parent)" @add-section="parent => emit('addSection', parent)" @add-action="parent => emit('addAction', parent)" />
          <v-menu><template #activator="{ props }"><v-btn v-bind="props" size="small" variant="text" color="primary" prepend-icon="mdi-plus">Agregar contenido</v-btn></template><v-list density="compact"><v-list-item prepend-icon="mdi-folder-plus-outline" title="Nueva sección" @click="emit('addSection', item.id)" /><v-list-item prepend-icon="mdi-plus-box-outline" title="Nueva acción" @click="emit('addAction', item.id)" /></v-list></v-menu>
        </v-card-text>
      </v-card>
      <v-card v-else variant="outlined" class="mb-2 action-node">
        <v-card-text class="d-flex align-center justify-space-between py-2 ga-2"><div class="d-flex align-center ga-3"><v-icon size="20" color="primary">{{ typeIcon(item.tipo) }}</v-icon><div><div class="font-weight-medium">{{ item.nombre }}</div><div class="text-caption text-medium-emphasis">{{ typeLabel(item.tipo) }}</div></div></div><div class="node-actions"><v-btn size="x-small" variant="text" icon="mdi-arrow-up" :disabled="index === 0" @click="emit('move', index, -1, parentId)" /><v-btn size="x-small" variant="text" icon="mdi-arrow-down" :disabled="index === items.length - 1" @click="emit('move', index, 1, parentId)" /><v-btn size="x-small" variant="text" icon="mdi-pencil" @click="emit('editAction', item, parentId)" /><v-btn size="x-small" variant="text" color="error" icon="mdi-delete-outline" @click="emit('remove', item.id, parentId)" /></div></v-card-text>
      </v-card>
    </template>
  </div>
</template>
<style scoped>.stage-tree--nested { margin: 14px 0 8px 28px; padding-left: 14px; border-left: 2px solid rgb(var(--v-theme-borderColor)); }.section-node { background: rgba(var(--v-theme-primary), .018); }.node-actions { white-space: nowrap; }</style>
