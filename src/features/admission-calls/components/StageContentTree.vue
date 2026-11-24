<script setup lang="ts">
import type {
    AdmissionActivity,
    AdmissionContentItem,
    AdmissionSection
} from '../admission-calls.types';
import { ACTIVITY_OPTIONS } from '../admission-calls.constants';
import { esAdmissionSection } from '../admission-calls.helpers';

const props = defineProps<{
    items: AdmissionContentItem[];
    parentId?: string;
}>();

const emit = defineEmits<{
    editSection: [section: AdmissionSection];
    editAction: [activity: AdmissionActivity, parentId?: string];
    remove: [id: string, parentId?: string];
    move: [index: number, delta: number, parentId?: string];
    addAction: [parentId?: string];
}>();

function obtenerActivityLabel(tipo: string): string {
    return ACTIVITY_OPTIONS.find(option => option.value === tipo)?.title ?? tipo;
}

function obtenerActivityIcon(tipo: string): string {
    return ACTIVITY_OPTIONS.find(option => option.value === tipo)?.icon ?? 'mdi-text-box-outline';
}

function editarActivity(activity: AdmissionActivity, parentId?: string): void {
    emit('editAction', activity, parentId);
}

function eliminarContent(id: string, parentId?: string): void {
    emit('remove', id, parentId);
}

function moverContent(index: number, delta: number, parentId?: string): void {
    emit('move', index, delta, parentId);
}
</script>

<template>
    <div>
        <template v-for="(item, index) in props.items" :key="item.id">
            <v-card v-if="esAdmissionSection(item)" variant="outlined" class="mb-3 section-node">
                <v-card-text>
                    <div class="d-flex align-start justify-space-between ga-2">
                        <div class="d-flex ga-3">
                            <v-icon color="primary" class="mt-1">mdi-folder-outline</v-icon>
                            <div>
                                <div class="font-weight-medium">{{ item.nombre }}</div>
                                <div v-if="item.descripcion" class="text-caption text-medium-emphasis">
                                    {{ item.descripcion }}
                                </div>
                            </div>
                        </div>
                        <div class="node-actions">
                            <v-btn size="x-small" variant="text" icon="mdi-arrow-up" :disabled="index === 0" @click="emit('move', index, -1, props.parentId)" />
                            <v-btn size="x-small" variant="text" icon="mdi-arrow-down" :disabled="index === props.items.length - 1" @click="emit('move', index, 1, props.parentId)" />
                            <v-btn size="x-small" variant="text" icon="mdi-pencil" @click="emit('editSection', item)" />
                            <v-btn size="x-small" variant="text" color="error" icon="mdi-delete-outline" @click="emit('remove', item.id, props.parentId)" />
                        </div>
                    </div>

                    <div class="section-blocks mt-3">
                        <StageContentTree
                            :items="item.contenido"
                            :parent-id="item.id"
                            @edit-section="emit('editSection', $event)"
                            @edit-action="editarActivity"
                            @remove="eliminarContent"
                            @move="moverContent"
                            @add-action="emit('addAction', $event)"
                        />
                    </div>

                    <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="emit('addAction', item.id)">
                        Agregar bloque
                    </v-btn>
                </v-card-text>
            </v-card>

            <v-card v-else variant="outlined" class="mb-2">
                <v-card-text class="d-flex align-center justify-space-between py-2">
                    <div class="d-flex ga-2 align-center">
                        <v-icon size="20" color="primary">{{ obtenerActivityIcon(item.tipo) }}</v-icon>
                        <div>
                            <div class="font-weight-medium">{{ item.nombre }}</div>
                            <div class="text-caption text-medium-emphasis">{{ obtenerActivityLabel(item.tipo) }}</div>
                        </div>
                    </div>
                    <div>
                        <v-btn size="x-small" variant="text" icon="mdi-arrow-up" :disabled="index === 0" @click="emit('move', index, -1, props.parentId)" />
                        <v-btn size="x-small" variant="text" icon="mdi-arrow-down" :disabled="index === props.items.length - 1" @click="emit('move', index, 1, props.parentId)" />
                        <v-btn size="x-small" variant="text" icon="mdi-pencil" @click="emit('editAction', item, props.parentId)" />
                        <v-btn size="x-small" variant="text" color="error" icon="mdi-delete-outline" @click="emit('remove', item.id, props.parentId)" />
                    </div>
                </v-card-text>
            </v-card>
        </template>
    </div>
</template>

<style scoped>
.section-node {
    background: rgba(var(--v-theme-primary), .018);
}

.section-blocks {
    margin-left: 20px;
    padding-left: 12px;
    border-left: 2px solid rgb(var(--v-theme-borderColor));
}
</style>
