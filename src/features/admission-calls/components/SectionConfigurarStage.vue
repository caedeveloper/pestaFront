<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';
import MdlConfigurarSection from './MdlConfigurarSection.vue';
import MdlConfigurarActivity from './MdlConfigurarActivity.vue';
import StageContentTree from './StageContentTree.vue';
import type { AdmissionActivity, AdmissionContentItem, AdmissionSection, AdmissionStage } from '../admission-calls.types';
import { esAdmissionSection, inicializarStageGuardianPermissions } from '../admission-calls.helpers';
import { ACTIVITY_TYPES, CONTENT_TYPES } from '../admission-calls.constants';
const props = defineProps<{ convocatoriaId: string; stages: AdmissionStage[] }>();
const emit = defineEmits<{ 'update:stages': [stages: AdmissionStage[]]; 'editing-change': [editing: boolean] }>();
type Tab = 'content' | 'connections' | 'schedule' | 'permissions';
type SectionDialog = { parentId?: string; section: AdmissionSection };
type ActionDialog = { parentId?: string; action: AdmissionActivity };
const editing = ref<AdmissionStage | null>(null);
const tab = ref<Tab>('content');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const deleting = ref<AdmissionStage | null>(null);
const sectionDialog = ref<SectionDialog | null>(null);
const actionDialog = ref<ActionDialog | null>(null);

const connectionToAdd = ref<string | null>(null);
watch(() => editing.value !== null, (value) => emit('editing-change', value));
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const ordered = computed(() => [...props.stages].sort((a, b) => a.orden - b.orden));
function normalizarStages(stages: AdmissionStage[]): AdmissionStage[] {
    return stages.map((stage, index) => ({ ...stage, orden: index + 1 }));
}
function crearStage(): AdmissionStage {
    return {
        id: crypto.randomUUID(),
        admissionCallId: props.convocatoriaId,
        nombre: '',
        descripcion: '',
        orden: ordered.value.length + 1,
        fechaInicio: '',
        fechaCierre: '',
        fechaPublicacion: '',
        contenido: [],
        connectionIds: [],
        guardianPermissions: inicializarStageGuardianPermissions()
    };
}
function iniciarConfiguracionStage(stage?: AdmissionStage) {
    editing.value = clone(stage ?? crearStage());
    tab.value = 'content';
    connectionToAdd.value = null;
    message.value = '';
}
function guardarStage(close = false) {
    if (!editing.value) return;
    if (!editing.value.nombre.trim()) {
        messageType.value = 'error';
        message.value = 'Ingrese un nombre para la etapa.';
        return;
    }
    const list = [...ordered.value];
    const index = list.findIndex((stage) => stage.id === editing.value?.id);
    const value = clone({ ...editing.value, nombre: editing.value.nombre.trim() });
    if (index < 0) list.push(value);
    else list.splice(index, 1, value);
    emit('update:stages', normalizarStages(list));
    messageType.value = 'success';
    message.value = 'Etapa actualizada en el borrador. Guarda la convocatoria para aplicar los cambios.';
    if (close) editing.value = null;
}
function contarActivities(items: AdmissionContentItem[] = []): number {
    return items.reduce((total, item) => total + (esAdmissionSection(item) ? contarActivities(item.contenido) : 1), 0);
}
function moverStage(index: number, delta: number) {
    const list = [...ordered.value];
    const target = index + delta;
    if (index < 0 || index >= list.length || target < 0 || target >= list.length) return;
    const current = list[index];
    const next = list[target];
    if (!current || !next) return;
    list[index] = next;
    list[target] = current;
    emit('update:stages', normalizarStages(list));
}
function duplicarStageContent(items: AdmissionContentItem[]): AdmissionContentItem[] {
    return items.map(item => {
        if (esAdmissionSection(item)) {
            return { ...item, id: crypto.randomUUID(), contenido: duplicarStageContent(item.contenido) };
        }
        return {
            ...item,
            id: crypto.randomUUID(),
            documentos: item.documentos?.map(document => ({ ...document, id: crypto.randomUUID() }))
        };
    });
}
function duplicarStage(stage: AdmissionStage) {
    const copy = clone(stage);
    copy.contenido = duplicarStageContent(copy.contenido);
    copy.id = crypto.randomUUID();
    copy.nombre += ' (copia)';
    copy.orden = ordered.value.length + 1;
    copy.connectionIds = [];
    emit('update:stages', normalizarStages([...ordered.value, copy]));
    messageType.value = 'success';
    message.value = 'Etapa duplicada.';
}
function eliminarStage() {
    if (!deleting.value) return;
    const id = deleting.value.id;
    emit(
        'update:stages',
        normalizarStages(
            ordered.value
                .filter((stage) => stage.id !== id)
                .map((stage) => ({ ...stage, connectionIds: stage.connectionIds.filter((value) => value !== id) }))
        )
    );
    deleting.value = null;
    messageType.value = 'success';
    message.value = 'Etapa eliminada.';
}
function buscarSection(id: string, items = editing.value?.contenido || []): AdmissionSection | undefined {
    for (const item of items) {
        if (esAdmissionSection(item)) {
            if (item.id === id) return item;
            const found = buscarSection(id, item.contenido);
            if (found) return found;
        }
    }
}
function obtenerStageContent(parentId?: string) {
    return parentId ? buscarSection(parentId)?.contenido || [] : editing.value?.contenido || [];
}
function establecerStageContent(items: AdmissionContentItem[], parentId?: string) {
    if (!editing.value) return;
    if (parentId) {
        const parent = buscarSection(parentId);
        if (parent) parent.contenido = items;
    } else editing.value.contenido = items;
}
function normalizarStageContent(items: AdmissionContentItem[]) {
    return items.map((item, index) => ({ ...item, orden: index + 1 }));
}
function crearSection(parentId?: string) {
    sectionDialog.value = {
        parentId,
        section: {
            id: crypto.randomUUID(),
            tipo: CONTENT_TYPES.SECTION,
            nombre: '',
            descripcion: '',
            orden: obtenerStageContent(parentId).length + 1,
            contenido: []
        }
    };
}
function editarSection(section: AdmissionSection) {
    const parentId = buscarSectionParent(section.id);
    sectionDialog.value = { parentId, section: clone(section) };
}
function buscarSectionParent(id: string, items = editing.value?.contenido || [], parentId?: string): string | undefined {
    for (const item of items) {
        if (item.id === id) return parentId;
        if (esAdmissionSection(item)) {
            const found = buscarSectionParent(id, item.contenido, item.id);
            if (found !== undefined) return found;
        }
    }
    return undefined;
}
function guardarSection(section: AdmissionSection): void {
    if (!sectionDialog.value || !section.nombre.trim()) return;
    const { parentId } = sectionDialog.value;
    const items = clone(obtenerStageContent(parentId));
    const index = items.findIndex((item) => item.id === section.id);
    if (index < 0) items.push(section);
    else items.splice(index, 1, section);
    establecerStageContent(normalizarStageContent(items), parentId);
    sectionDialog.value = null;
}
function crearActivity(parentId?: string) {
    actionDialog.value = {
        parentId,
        action: { id: crypto.randomUUID(), nombre: '', tipo: ACTIVITY_TYPES.RICH_TEXT, orden: obtenerStageContent(parentId).length + 1, richText: '' }
    };
}
function editarActivity(action: AdmissionActivity, parentId?: string) {
    actionDialog.value = { parentId, action: clone(action) };
}
function guardarActivity(action: AdmissionActivity): void {
    if (!actionDialog.value || !action.nombre.trim()) return;
    const { parentId } = actionDialog.value;
    const items = clone(obtenerStageContent(parentId));
    const index = items.findIndex((item) => item.id === action.id);
    if (index < 0) items.push(action);
    else items.splice(index, 1, action);
    establecerStageContent(normalizarStageContent(items), parentId);
    actionDialog.value = null;
}
function eliminarStageContent(id: string, parentId?: string) {
    establecerStageContent(normalizarStageContent(obtenerStageContent(parentId).filter((item) => item.id !== id)), parentId);
}
function moverStageContent(index: number, delta: number, parentId?: string) {
    const items = clone(obtenerStageContent(parentId));
    const target = index + delta;
    if (index < 0 || index >= items.length || target < 0 || target >= items.length) return;
    const current = items[index];
    const next = items[target];
    if (!current || !next) return;
    items[index] = next;
    items[target] = current;
    establecerStageContent(normalizarStageContent(items), parentId);
}
function agregarStageConnection(id: string | null) {
    connectionToAdd.value = null;
    if (!editing.value || !id || id === editing.value.id || editing.value.connectionIds.includes(id)) return;
    if (!ordered.value.some(stage => stage.id === id)) return;
    editing.value.connectionIds = [...editing.value.connectionIds, id];
    // Mantener sincronizado el borrador de la convocatoria al cambiar conexiones.
    guardarStage(false);
}
function eliminarStageConnection(id: string) {
    if (!editing.value) return;
    editing.value.connectionIds = editing.value.connectionIds.filter((value) => value !== id);
    guardarStage(false);
}
const availableConnections = computed(() =>
    ordered.value.filter((stage) => stage.id !== editing.value?.id && !editing.value?.connectionIds.includes(stage.id))
);
</script>
<template>
    <v-alert v-if="message" :type="messageType" variant="tonal" density="compact" closable class="mb-4" @click:close="message = ''">{{
        message
    }}</v-alert>
    <template v-if="editing">
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="editing = null">Volver a etapas</v-btn>
        <UiParentCard :title="editing.nombre || 'Nueva etapa'" icon="mdi-format-list-bulleted-square"
            ><template #action><v-btn color="primary" @click="guardarStage(true)">Guardar etapa</v-btn></template>
            <v-row class="mb-1"
                ><v-col cols="12" md="6"
                    ><v-text-field v-model="editing.nombre" label="Nombre de la etapa *" placeholder="Ej. Registro de postulantes" /></v-col
                ><v-col cols="12" md="6"
                    ><v-textarea
                        v-model="editing.descripcion"
                        label="Descripción"
                        placeholder="Describe brevemente el objetivo de esta etapa..."
                        rows="1"
                        auto-grow /></v-col
            ></v-row>
            <v-tabs v-model="tab"
                ><v-tab value="content">Contenido</v-tab><v-tab value="connections">Conexiones</v-tab
                ><v-tab value="schedule">Programación</v-tab><v-tab value="permissions">Permisos</v-tab></v-tabs
            ><v-divider class="mb-5" />
            <div v-if="tab === 'content'">
                <div class="d-flex flex-wrap justify-end align-center ga-3 mb-4">
                    <div class="d-flex ga-2">
                        <v-btn variant="outlined" color="primary" prepend-icon="mdi-folder-plus-outline" @click="crearSection()"
                            >Sección</v-btn
                        >
                    </div>
                </div>
                <v-empty-state
                    v-if="!editing.contenido.length"
                    icon="mdi-folder-outline"
                    title="Aún no hay contenido"
                    text="Agregue una sección o un bloque para comenzar."
                /><StageContentTree
                    v-else
                    :items="editing.contenido"
                    @edit-section="editarSection"
                    @edit-action="editarActivity"
                    @remove="eliminarStageContent"
                    @move="moverStageContent"
                    @add-action="crearActivity"
                />
            </div>
            <div v-else-if="tab === 'connections'">
                <v-select
                    v-model="connectionToAdd"
                    :items="availableConnections"
                    item-title="nombre"
                    item-value="id"
                    label="Agregar conexión"
                    clearable
                    @update:model-value="agregarStageConnection"
                /><v-empty-state
                    v-if="!editing.connectionIds.length"
                    icon="mdi-source-branch"
                    title="Sin conexiones configuradas"
                    text="Seleccione una etapa destino para crear una conexión."
                /><v-list v-else border rounded
                    ><v-list-item
                        v-for="id in editing.connectionIds"
                        :key="id"
                        :title="ordered.find((stage) => stage.id === id)?.nombre || 'Etapa no disponible'"
                        prepend-icon="mdi-arrow-right-circle-outline"
                        ><template #append
                            ><v-btn
                                size="small"
                                variant="text"
                                color="error"
                                icon="mdi-delete-outline"
                                @click="eliminarStageConnection(id)" /></template></v-list-item
                ></v-list>
            </div>
            <v-row v-else-if="tab === 'schedule'"
                ><v-col cols="12" md="4"
                    ><v-text-field
                        v-model="editing.fechaInicio"
                        type="datetime-local"
                        label="Fecha de apertura"
                        hint="Opcional"
                        persistent-hint /></v-col
                ><v-col cols="12" md="4"
                    ><v-text-field
                        v-model="editing.fechaCierre"
                        type="datetime-local"
                        label="Fecha de cierre de actividades"
                        hint="Opcional"
                        persistent-hint /></v-col
                ><v-col cols="12" md="4"
                    ><v-text-field
                        v-model="editing.fechaPublicacion"
                        type="datetime-local"
                        label="Fecha de publicación de resultados"
                        hint="Opcional"
                        persistent-hint /></v-col
            ></v-row>
            <div v-else class="py-2">
                <div class="text-h6 mb-1">Permisos del tutor</div>
                <div class="text-body-2 text-medium-emphasis mb-4">Configura qué información puede modificar el tutor mientras el postulante se encuentre en esta etapa.</div>
                <v-list border rounded>
                    <v-list-item title="Permitir editar datos del postulante" subtitle="El tutor podrá modificar la información del postulante registrada inicialmente."><template #append><v-switch v-model="editing.guardianPermissions.canEditApplicant" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir editar datos del tutor" subtitle="El tutor podrá modificar su propia información personal."><template #append><v-switch v-model="editing.guardianPermissions.canEditOwnData" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir agregar tutores" subtitle="El tutor podrá incorporar nuevos tutores vinculados al postulante."><template #append><v-switch v-model="editing.guardianPermissions.canAddGuardians" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir gestionar tutores vinculados" subtitle="El tutor podrá administrar las vinculaciones existentes según las reglas familiares del sistema."><template #append><v-switch v-model="editing.guardianPermissions.canManageGuardians" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir modificar documentos" subtitle="El tutor podrá cargar o reemplazar documentos cuando las acciones configuradas lo permitan."><template #append><v-switch v-model="editing.guardianPermissions.canEditDocuments" color="primary" hide-details /></template></v-list-item>
                </v-list>
            </div>
        </UiParentCard>
    </template>
    <template v-else
        ><div class="d-flex flex-wrap align-end justify-space-between mb-5 ga-3">
            <div>
                <div class="text-h6 font-weight-semibold">Etapas de admisión</div>
                <div class="text-body-2 text-medium-emphasis">Administra secciones, bloques, conexiones y programación.</div>
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="iniciarConfiguracionStage()">Nueva etapa</v-btn>
        </div>
        <UiParentCard v-if="!ordered.length" title="Etapas de admisión" icon="mdi-format-list-bulleted-square"
            ><v-empty-state
                icon="mdi-calendar-outline"
                title="Aún no hay etapas"
                text="Cree la primera etapa para construir el proceso de admisión."
                ><template #actions><v-btn color="primary" @click="iniciarConfiguracionStage()">Crear primera etapa</v-btn></template></v-empty-state
            ></UiParentCard
        ><v-row v-else
            ><v-col v-for="(stage, index) in ordered" :key="stage.id" cols="12"
                ><UiParentCard
                    :title="stage.nombre"
                    :subtitle="stage.descripcion || 'Sin descripción'"
                    icon="mdi-format-list-bulleted-square"
                    class="h-100"
                    ><template #action
                        ><v-menu
                            ><template #activator="{ props: menuProps }"
                                ><v-btn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" size="small" /></template
                            ><v-list density="compact"
                                ><v-list-item title="Editar" @click="iniciarConfiguracionStage(stage)" /><v-list-item
                                    title="Duplicar"
                                    @click="duplicarStage(stage)" /><v-list-item
                                    title="Eliminar"
                                    base-color="error"
                                    @click="deleting = stage" /></v-list></v-menu
                    ></template>
                    <div class="d-flex flex-wrap ga-2 mb-4">
                        <v-chip size="small" variant="tonal"
                            >{{ stage.contenido.filter(esAdmissionSection).length }} secciones</v-chip
                        ><v-chip size="small" variant="tonal">{{ contarActivities(stage.contenido) }} bloques</v-chip
                        ><v-chip size="small" variant="tonal">{{ stage.connectionIds.length }} conexiones</v-chip>
                    </div>
                    <div class="d-flex justify-space-between">
                        <v-btn size="small" variant="tonal" color="primary" @click="iniciarConfiguracionStage(stage)">Configurar</v-btn>
                        <div>
                            <v-btn
                                size="small"
                                variant="text"
                                icon="mdi-arrow-up"
                                :disabled="index === 0"
                                @click="moverStage(index, -1)"
                            /><v-btn
                                size="small"
                                variant="text"
                                icon="mdi-arrow-down"
                                :disabled="index === ordered.length - 1"
                                @click="moverStage(index, 1)"
                            />
                        </div></div></UiParentCard></v-col></v-row
    ></template>
    <HeinrichModal
        :show="Boolean(deleting)"
        title="Eliminar etapa"
        :width="500"
        primary-text="Eliminar"
        primary-icon="mdi-delete-outline"
        primary-color="error"
        persistent
        @confirm="eliminarStage"
        @cancel="deleting = null"
    >
        <p>
            Se eliminará <b>{{ deleting?.nombre }}</b>
            y se retirarán sus conexiones relacionadas.
        </p>
    </HeinrichModal>
    <MdlConfigurarSection
        v-if="sectionDialog"
        :key="sectionDialog.section.id"
        :section="sectionDialog.section"
        @save="guardarSection"
        @close="sectionDialog = null"
    />
    <MdlConfigurarActivity
        v-if="actionDialog"
        :key="actionDialog.action.id"
        :activity="actionDialog.action"
        @save="guardarActivity"
        @close="actionDialog = null"
    />
</template>
