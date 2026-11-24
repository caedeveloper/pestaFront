<script setup lang="ts">
import type { AdmissionAction, AdmissionContentItem, AdmissionDocument } from '@/mocks/convocatorias.mock';
import type { AdmissionActionResponse, UploadedAdmissionFile } from '@/mocks/admissionOperational.store';
const props = defineProps<{ items: AdmissionContentItem[]; responses: Record<string, AdmissionActionResponse>; mode: 'editable' | 'readonly'; postulanteId: number }>();
const emit = defineEmits<{ changed: [] }>();
const isSection = (item: AdmissionContentItem) => item.tipo === 'section';
const safeHtml = (html = '') => {
  if (typeof window === 'undefined') return html;
  const root = new DOMParser().parseFromString(html, 'text/html');
  root.querySelectorAll('script, style, iframe, object, embed').forEach(node => node.remove());
  root.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => { if (attr.name.startsWith('on') || (attr.name === 'href' && /^javascript:/i.test(attr.value))) node.removeAttribute(attr.name); }));
  return root.body.innerHTML;
};
function response(action: AdmissionAction) { return props.responses[action.id] || (props.responses[action.id] = {}); }
function accept(action: AdmissionAction, document: AdmissionDocument) { return (document.formatosPermitidos || action.formatosPermitidos || '').split(',').map(value => value.trim()).filter(Boolean).map(value => value.startsWith('.') ? value : `.${value}`).join(','); }
function maxSize(action: AdmissionAction, document: AdmissionDocument) { return document.tamanoMaximo ?? action.tamanoMaximo; }
function replacementAllowed(action: AdmissionAction, document: AdmissionDocument) { return document.permitirReemplazo ?? action.permitirReemplazo; }
async function loadFile(action: AdmissionAction, document: AdmissionDocument, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  const maximum = maxSize(action, document); const max = maximum ? maximum * 1024 * 1024 : undefined;
  if (max && file.size > max) { window.alert(`El archivo excede el máximo de ${maximum} MB.`); return; }
  const dataUrl = await new Promise<string | undefined>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => resolve(undefined); reader.readAsDataURL(file); });
  const current = response(action); current.documentos ||= {}; current.documentos[document.id] = { nombre: file.name, tipo: file.type, tamano: file.size, dataUrl, cargadoEn: new Date().toISOString() }; emit('changed');
}
function clearFile(action: AdmissionAction, documentId: string) { if (response(action).documentos) delete response(action).documentos![documentId]; emit('changed'); }
function fileFor(action: AdmissionAction, documentId: string): UploadedAdmissionFile | undefined { return response(action).documentos?.[documentId]; }
</script>
<template>
  <template v-for="item in items" :key="item.id">
    <v-card v-if="isSection(item)" variant="outlined" class="stage-section mb-4"><v-card-item><template #prepend><v-icon color="primary">mdi-folder-outline</v-icon></template><v-card-title class="text-subtitle-1">{{ item.nombre }}</v-card-title><v-card-subtitle v-if="item.descripcion">{{ item.descripcion }}</v-card-subtitle></v-card-item><v-card-text class="pt-1"><HeinrichStageRendererItems :items="item.contenido || []" :responses="responses" :mode="mode" :postulante-id="postulanteId" @changed="emit('changed')" /></v-card-text></v-card>
    <div v-else class="stage-action mb-5">
      <div v-if="item.tipo === 'richText'" class="rich-content" v-html="safeHtml(item.richText)" />
      <div v-else-if="item.tipo === 'confirmation'"><div v-if="item.descripcion" class="text-body-2 mb-2">{{ item.descripcion }}</div><div class="text-body-1 mb-3">{{ item.textoConfirmacion }}</div><v-checkbox :model-value="Boolean(response(item).confirmado)" :label="item.etiquetaConfirmacion || 'Confirmo la información indicada'" :readonly="mode === 'readonly'" :disabled="mode === 'readonly'" hide-details @update:model-value="value => { response(item).confirmado = Boolean(value); response(item).confirmadoEn = value ? new Date().toISOString() : undefined; response(item).confirmadoPor = value ? 'Tutor responsable' : undefined; emit('changed'); }" /><div v-if="response(item).confirmado && mode === 'readonly'" class="text-caption text-medium-emphasis mt-1">Confirmado por {{ response(item).confirmadoPor || 'Tutor responsable' }}.</div></div>
      <div v-else><div class="text-subtitle-2 mb-1">{{ item.nombre }}</div><div v-if="item.descripcion" class="text-body-2 text-medium-emphasis mb-3">{{ item.descripcion }}</div><v-card v-for="document in item.documentos || []" :key="document.id" variant="outlined" class="mb-2"><v-card-text class="d-flex flex-wrap align-center ga-3 py-3"><v-icon color="primary">mdi-file-document-outline</v-icon><div class="flex-grow-1"><div class="font-weight-medium">{{ document.nombre }} <span v-if="document.obligatorio" class="text-error">*</span></div><div v-if="document.descripcion" class="text-caption text-medium-emphasis">{{ document.descripcion }}</div><v-btn v-if="document.plantilla?.dataUrl" size="x-small" variant="text" class="px-0" :href="document.plantilla.dataUrl" :download="document.plantilla.nombre">Descargar plantilla</v-btn><div v-if="fileFor(item, document.id)" class="text-caption text-success">{{ fileFor(item, document.id)?.nombre }}</div><div v-else class="text-caption text-medium-emphasis">Pendiente</div></div><div class="d-flex ga-1"><v-btn v-if="fileFor(item, document.id)?.dataUrl" size="small" variant="text" icon="mdi-eye-outline" :href="fileFor(item, document.id)?.dataUrl" target="_blank" title="Ver archivo" /><v-btn v-if="mode === 'editable' && (!fileFor(item, document.id) || replacementAllowed(item, document))" size="small" color="primary" variant="tonal" @click="($refs[`file-${item.id}-${document.id}`] as HTMLInputElement)?.click()">{{ fileFor(item, document.id) ? 'Reemplazar' : 'Adjuntar' }}</v-btn><v-btn v-if="mode === 'editable' && fileFor(item, document.id)" size="small" variant="text" color="error" icon="mdi-delete-outline" @click="clearFile(item, document.id)" /></div><input :ref="`file-${item.id}-${document.id}`" type="file" class="d-none" :accept="accept(item, document)" @change="loadFile(item, document, $event)" /></v-card-text></v-card><div v-if="!(item.documentos || []).length" class="text-body-2 text-medium-emphasis">No se configuraron documentos para esta acción.</div></div>
    </div>
  </template>
</template>
<style scoped>.stage-section { background: rgba(var(--v-theme-primary), .018); }.stage-action { padding: 0 4px; }.rich-content :deep(p) { margin-bottom: .75rem; }.rich-content :deep(a) { color: rgb(var(--v-theme-primary)); text-decoration: underline; }.rich-content :deep(ul) { padding-left: 1.25rem; }</style>
