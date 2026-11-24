<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UiModal from '@/components/shared/UiModal.vue';
import HeinrichRichTextEditor from '@/components/heinrich/HeinrichRichTextEditor.vue';
import StageContentTree from './StageContentTree.vue';
import type { AdmissionAction, AdmissionActionType, AdmissionContentItem, AdmissionDocument, AdmissionSection, AdmissionStage } from '../convocatorias.mock';
import { newStageTutorPermissions } from '../stageTutorPermissions';

const props = defineProps<{ convocatoriaId: string; stages: AdmissionStage[] }>();
const emit = defineEmits<{ 'update:stages': [stages: AdmissionStage[]]; 'editing-change': [editing: boolean] }>();
type Tab = 'content' | 'connections' | 'schedule' | 'permissions';
type SectionDialog = { parentId?: string; section: AdmissionSection };
type ActionDialog = { parentId?: string; action: AdmissionAction };
const editing = ref<AdmissionStage | null>(null);
const tab = ref<Tab>('content');
const message = ref('');
const deleting = ref<AdmissionStage | null>(null);
const sectionDialog = ref<SectionDialog | null>(null);
const actionDialog = ref<ActionDialog | null>(null);
// This selection is intentionally separate from connectionIds. Once a target is
// added it is removed from the available options, so retaining it in the select
// would make Vuetify render its raw id instead of the stage name.
const connectionToAdd = ref<string | null>(null);
watch(editing, (value) => emit('editing-change', Boolean(value)));
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const ordered = computed(() => [...props.stages].sort((a, b) => a.orden - b.orden));
const actionLabels: Record<AdmissionActionType, string> = {
    richText: 'Texto enriquecido',
    documentUpload: 'Carga de documentos',
    confirmation: 'Confirmación'
};
function legacyContent(stage: AdmissionStage): AdmissionContentItem[] {
    if (stage.contenido) return stage.contenido;
    return (stage.secciones || []).map((section: any) => ({
        id: section.id,
        tipo: 'section',
        nombre: section.nombre,
        descripcion: section.descripcion,
        orden: section.orden,
        contenido: (section.acciones || []).map((action: any) => ({
            ...action,
            tipo: action.tipo === 'Formulario' ? 'documentUpload' : action.tipo === 'Validación' ? 'confirmation' : 'richText'
        }))
    }));
}
function normalize(stages: AdmissionStage[]) {
    return stages.map((stage, index) => ({
        ...stage,
        orden: index + 1,
        workflowIds: [],
        contenido: legacyContent(stage),
        connectionIds: stage.connectionIds || [],
        tutorPermissions: stage.tutorPermissions || newStageTutorPermissions()
    }));
}
function newStage(): AdmissionStage {
    return {
        id: `stage-${Date.now()}`,
        convocatoriaId: props.convocatoriaId,
        nombre: '',
        descripcion: '',
        orden: ordered.value.length + 1,
        fechaInicio: '',
        fechaCierre: '',
        fechaPublicacion: '',
        contenido: [],
        connectionIds: [],
        tutorPermissions: newStageTutorPermissions()
    };
}
function begin(stage?: AdmissionStage) {
    editing.value = normalize([clone(stage || newStage())])[0];
    tab.value = 'content';
}
function save(close = false) {
    if (!editing.value) return;
    if (!editing.value.nombre.trim()) {
        message.value = 'Ingrese un nombre para la etapa.';
        return;
    }
    const list = [...props.stages];
    const index = list.findIndex((stage) => stage.id === editing.value?.id);
    const value = clone({ ...editing.value, nombre: editing.value.nombre.trim() });
    if (index < 0) list.push(value);
    else list.splice(index, 1, value);
    emit('update:stages', normalize(list));
    message.value = 'Etapa actualizada en el borrador. Guarda la convocatoria para aplicar los cambios.';
    if (close) editing.value = null;
}
function actionCount(items: AdmissionContentItem[] = []): number {
    return items.reduce((total, item) => total + (item.tipo === 'section' ? actionCount(item.contenido || []) : 1), 0);
}
function moveStage(index: number, delta: number) {
    const list = ordered.value;
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    emit('update:stages', normalize(list));
}
function duplicate(stage: AdmissionStage) {
    const copy = clone(stage);
    copy.id = `stage-${Date.now()}`;
    copy.nombre += ' (copia)';
    copy.orden = ordered.value.length + 1;
    copy.connectionIds = [];
    emit('update:stages', normalize([...props.stages, copy]));
    message.value = 'Etapa duplicada.';
}
function removeStage() {
    if (!deleting.value) return;
    const id = deleting.value.id;
    emit(
        'update:stages',
        normalize(
            props.stages
                .filter((stage) => stage.id !== id)
                .map((stage) => ({ ...stage, connectionIds: (stage.connectionIds || []).filter((value) => value !== id) }))
        )
    );
    deleting.value = null;
    message.value = 'Etapa eliminada.';
}
function findSection(id: string, items = editing.value?.contenido || []): AdmissionSection | undefined {
    for (const item of items) {
        if (item.tipo === 'section') {
            if (item.id === id) return item;
            const found = findSection(id, item.contenido || []);
            if (found) return found;
        }
    }
}
function getItems(parentId?: string) {
    return parentId ? findSection(parentId)?.contenido || [] : editing.value?.contenido || [];
}
function setItems(items: AdmissionContentItem[], parentId?: string) {
    if (!editing.value) return;
    if (parentId) {
        const parent = findSection(parentId);
        if (parent) parent.contenido = items;
    } else editing.value.contenido = items;
}
function normalizeItems(items: AdmissionContentItem[]) {
    return items.map((item, index) => ({ ...item, orden: index + 1 }));
}
function newSection(parentId?: string) {
    sectionDialog.value = {
        parentId,
        section: {
            id: `section-${Date.now()}`,
            tipo: 'section',
            nombre: '',
            descripcion: '',
            orden: getItems(parentId).length + 1,
            contenido: []
        }
    };
}
function editSection(section: AdmissionSection) {
    const parentId = findParent(section.id);
    sectionDialog.value = { parentId, section: clone(section) };
}
function findParent(id: string, items = editing.value?.contenido || [], parentId?: string): string | undefined {
    for (const item of items) {
        if (item.id === id) return parentId;
        if (item.tipo === 'section') {
            const found = findParent(id, item.contenido || [], item.id);
            if (found !== undefined) return found;
        }
    }
    return undefined;
}
function saveSection() {
    if (!sectionDialog.value?.section.nombre.trim()) return;
    const { parentId, section } = sectionDialog.value;
    const items = clone(getItems(parentId));
    const index = items.findIndex((item) => item.id === section.id);
    if (index < 0) items.push(section);
    else items.splice(index, 1, section);
    setItems(normalizeItems(items), parentId);
    sectionDialog.value = null;
}
function newAction(parentId?: string) {
    actionDialog.value = {
        parentId,
        action: { id: `action-${Date.now()}`, nombre: '', tipo: 'richText', orden: getItems(parentId).length + 1, richText: '' }
    };
}
function editAction(action: AdmissionAction, parentId?: string) {
    actionDialog.value = { parentId, action: clone(action) };
}
function saveAction() {
    if (!actionDialog.value?.action.nombre.trim()) return;
    const { parentId, action } = actionDialog.value;
    const items = clone(getItems(parentId));
    const index = items.findIndex((item) => item.id === action.id);
    if (index < 0) items.push(action);
    else items.splice(index, 1, action);
    setItems(normalizeItems(items), parentId);
    actionDialog.value = null;
}
function removeItem(id: string, parentId?: string) {
    setItems(normalizeItems(getItems(parentId).filter((item) => item.id !== id)), parentId);
}
function moveItem(index: number, delta: number, parentId?: string) {
    const items = clone(getItems(parentId));
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setItems(normalizeItems(items), parentId);
}
function addConnection(id: string | null) {
    connectionToAdd.value = null;
    if (!editing.value || !id || id === editing.value.id || editing.value.connectionIds?.includes(id)) return;
    editing.value.connectionIds = [...(editing.value.connectionIds || []), id];
    // Keep the parent convocatoria draft in sync as soon as a connection is made.
    // This also makes the footer's “Guardar borrador” persist the new connection.
    save(false);
}
function removeConnection(id: string) {
    if (!editing.value) return;
    editing.value.connectionIds = (editing.value.connectionIds || []).filter((value) => value !== id);
    save(false);
}
const availableConnections = computed(() =>
    ordered.value.filter((stage) => stage.id !== editing.value?.id && !editing.value?.connectionIds?.includes(stage.id))
);
async function loadDocumentTemplate(document: AdmissionDocument, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
    document.plantilla = { nombre: file.name, tipo: file.type, dataUrl };
}
</script>

<template>
    <v-alert v-if="message" type="success" variant="tonal" density="compact" closable class="mb-4" @click:close="message = ''">{{
        message
    }}</v-alert>
    <template v-if="editing">
        <v-btn variant="text" class="px-0 mb-4" prepend-icon="mdi-arrow-left" @click="editing = null">Volver a etapas</v-btn>
        <UiParentCard :title="editing.nombre || 'Nueva etapa'" icon="mdi-format-list-bulleted-square"
            ><template #action><v-btn color="primary" @click="save(true)">Guardar etapa</v-btn></template>
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
                <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
                    <div class="d-flex ga-2">
                        <v-btn variant="outlined" color="primary" prepend-icon="mdi-folder-plus-outline" @click="newSection()"
                            >Sección</v-btn
                        ><v-btn color="primary" prepend-icon="mdi-plus" @click="newAction()">Bloque</v-btn>
                    </div>
                </div>
                <v-empty-state
                    v-if="!editing.contenido?.length"
                    icon="mdi-folder-outline"
                    title="Aún no hay contenido"
                    text="Agregue una sección o un bloque para comenzar."
                /><StageContentTree
                    v-else
                    :items="editing.contenido"
                    @edit-section="editSection"
                    @edit-action="editAction"
                    @remove="removeItem"
                    @move="moveItem"
                    @add-action="newAction"
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
                    @update:model-value="addConnection"
                /><v-empty-state
                    v-if="!editing.connectionIds?.length"
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
                                @click="removeConnection(id)" /></template></v-list-item
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
                    <v-list-item title="Permitir editar datos del postulante" subtitle="El tutor podrá modificar la información del postulante registrada inicialmente."><template #append><v-switch v-model="editing.tutorPermissions!.canEditApplicant" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir editar datos del tutor" subtitle="El tutor podrá modificar su propia información personal."><template #append><v-switch v-model="editing.tutorPermissions!.canEditOwnData" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir agregar tutores" subtitle="El tutor podrá incorporar nuevos tutores vinculados al postulante."><template #append><v-switch v-model="editing.tutorPermissions!.canAddTutors" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir gestionar tutores vinculados" subtitle="El tutor podrá administrar las vinculaciones existentes según las reglas familiares del sistema."><template #append><v-switch v-model="editing.tutorPermissions!.canManageTutors" color="primary" hide-details /></template></v-list-item>
                    <v-list-item title="Permitir modificar documentos" subtitle="El tutor podrá cargar o reemplazar documentos cuando las acciones configuradas lo permitan."><template #append><v-switch v-model="editing.tutorPermissions!.canEditDocuments" color="primary" hide-details /></template></v-list-item>
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
            <v-btn color="primary" prepend-icon="mdi-plus" @click="begin()">Nueva etapa</v-btn>
        </div>
        <UiParentCard v-if="!ordered.length" title="Etapas de admisión" icon="mdi-format-list-bulleted-square"
            ><v-empty-state
                icon="mdi-calendar-outline"
                title="Aún no hay etapas"
                text="Cree la primera etapa para construir el proceso de admisión."
                ><template #actions><v-btn color="primary" @click="begin()">Crear primera etapa</v-btn></template></v-empty-state
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
                                ><v-list-item title="Editar" @click="begin(stage)" /><v-list-item
                                    title="Duplicar"
                                    @click="duplicate(stage)" /><v-list-item
                                    title="Eliminar"
                                    base-color="error"
                                    @click="deleting = stage" /></v-list></v-menu
                    ></template>
                    <div class="d-flex flex-wrap ga-2 mb-4">
                        <v-chip size="small" variant="tonal"
                            >{{ legacyContent(stage).filter((item) => item.tipo === 'section').length }} secciones</v-chip
                        ><v-chip size="small" variant="tonal">{{ actionCount(legacyContent(stage)) }} bloques</v-chip
                        ><v-chip size="small" variant="tonal">{{ (stage.connectionIds || []).length }} conexiones</v-chip>
                    </div>
                    <div class="d-flex justify-space-between">
                        <v-btn size="small" variant="tonal" color="primary" @click="begin(stage)">Configurar</v-btn>
                        <div>
                            <v-btn
                                size="small"
                                variant="text"
                                icon="mdi-arrow-up"
                                :disabled="index === 0"
                                @click="moveStage(index, -1)"
                            /><v-btn
                                size="small"
                                variant="text"
                                icon="mdi-arrow-down"
                                :disabled="index === ordered.length - 1"
                                @click="moveStage(index, 1)"
                            />
                        </div></div></UiParentCard></v-col></v-row
    ></template>
    <UiModal :show="Boolean(deleting)" title="Eliminar etapa" persistent @update:show="deleting = null"
        ><p>
            Se eliminará <b>{{ deleting?.nombre }}</b> y se retirarán sus conexiones relacionadas.
        </p>
        <template #footer-actions
            ><v-btn variant="text" @click="deleting = null">Cancelar</v-btn
            ><v-btn color="error" @click="removeStage">Eliminar</v-btn></template
        ></UiModal
    >
    <UiModal :show="Boolean(sectionDialog)" title="Configurar sección" persistent @update:show="sectionDialog = null"
        ><template v-if="sectionDialog"
            ><v-text-field v-model="sectionDialog.section.nombre" label="Nombre de sección *" /><v-textarea
                v-model="sectionDialog.section.descripcion"
                label="Descripción"
                rows="2"
                auto-grow /></template
        ><template #footer-actions
            ><v-btn variant="text" @click="sectionDialog = null">Cancelar</v-btn
            ><v-btn color="primary" prepend-icon="mdi-content-save" :disabled="!sectionDialog?.section.nombre.trim()" @click="saveSection">Guardar sección</v-btn></template
        ></UiModal
    >
    <UiModal
        :show="Boolean(actionDialog)"
        :title="actionDialog?.action.nombre ? 'Editar bloque' : 'Nuevo bloque'"
        height="90vh"
        persistent
        hide-footer-close
        @update:show="actionDialog = null"
        ><template v-if="actionDialog"
            ><v-text-field v-model="actionDialog.action.nombre" label="Nombre del bloque *" /><v-select
                v-model="actionDialog.action.tipo"
                :items="Object.entries(actionLabels).map(([value, title]) => ({ value, title }))"
                label="Tipo de bloque *" /><template v-if="actionDialog.action.tipo === 'richText'"
                ><label class="text-body-2 font-weight-medium d-block mb-2">Contenido</label
                ><HeinrichRichTextEditor v-model="actionDialog.action.richText" /></template
            ><template v-else-if="actionDialog.action.tipo === 'documentUpload'"
                ><v-textarea v-model="actionDialog.action.descripcion" label="Descripción / instrucciones" rows="2" auto-grow />
                <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-2">Documentos esperados</span
                    ><v-btn
                        size="small"
                        variant="tonal"
                        color="primary"
                        @click="
                            actionDialog.action.documentos = [
                                ...(actionDialog.action.documentos || []),
                                { id: `document-${Date.now()}`, nombre: '', obligatorio: true, descripcion: '' }
                            ]
                        "
                        >Agregar documento</v-btn
                    >
                </div>
                <v-card
                    v-for="(document, index) in actionDialog.action.documentos || []"
                    :key="document.id"
                    variant="outlined"
                    class="pa-3 mb-2"
                    ><v-text-field v-model="document.nombre" density="compact" label="Nombre" hide-details class="mb-2" /><v-text-field
                        v-model="document.descripcion"
                        density="compact"
                        label="Descripción opcional"
                        hide-details
                        class="mb-2" />
                    <v-row dense class="mb-1"><v-col cols="12" md="5"><v-text-field v-model="document.formatosPermitidos" density="compact" label="Formatos permitidos" placeholder="PDF, JPG, PNG" hide-details /></v-col><v-col cols="12" md="4"><v-text-field v-model.number="document.tamanoMaximo" density="compact" type="number" min="1" label="Tamaño máximo (MB)" hide-details /></v-col><v-col cols="12" md="3" class="d-flex align-center"><v-checkbox v-model="document.permitirReemplazo" density="compact" label="Permitir reemplazo" hide-details /></v-col></v-row>
                    <div class="d-flex flex-wrap align-center ga-2 mb-2"><v-btn size="small" style="margin-top: 4px" variant="outlined" prepend-icon="mdi-file-upload-outline" @click="($refs[`template-${document.id}`] as HTMLInputElement)?.click()">{{ document.plantilla ? 'Cambiar plantilla' : 'Subir plantilla' }}</v-btn><span v-if="document.plantilla" class="text-caption text-medium-emphasis">{{ document.plantilla.nombre }}</span><v-btn v-if="document.plantilla" size="x-small" variant="text" color="error" icon="mdi-close" @click="document.plantilla = undefined" /><input :ref="`template-${document.id}`" type="file" class="d-none" @change="loadDocumentTemplate(document, $event)" /></div>
                    <div class="d-flex align-center">
                        <v-checkbox v-model="document.obligatorio" label="Obligatorio" density="compact" hide-details /><v-spacer /><v-btn
                            size="small"
                            variant="text"
                            color="error"
                            icon="mdi-delete-outline"
                            @click="actionDialog.action.documentos?.splice(index, 1)"
                        /></div></v-card
                ></template
            ><template v-else
                ><v-textarea v-model="actionDialog.action.descripcion" label="Descripción / instrucción" rows="2" auto-grow /><v-textarea
                    v-model="actionDialog.action.textoConfirmacion"
                    label="Texto de confirmación"
                    rows="2"
                    auto-grow /><v-text-field
                    v-model="actionDialog.action.etiquetaConfirmacion"
                    label="Etiqueta de confirmación"
                    placeholder="Confirmo que la información es correcta" /><v-checkbox
                    v-model="actionDialog.action.obligatorio"
                    label="Confirmación obligatoria"
                    hide-details /></template></template
        ><template #footer-actions
            ><v-btn variant="text" @click="actionDialog = null">Cancelar</v-btn
            ><v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" :disabled="!actionDialog?.action.nombre.trim()" @click="saveAction">Guardar</v-btn></template
        ></UiModal
    >
</template>
