<script setup lang="ts">
import { computed, ref } from 'vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';
import HeinrichRichTextEditor from '@/components/heinrich/HeinrichRichTextEditor.vue';
import { ACTIVITY_TYPES, ACTIVITY_OPTIONS } from '../admission-calls.constants';
import type { AdmissionActivity, AdmissionDocument } from '../admission-calls.types';

const props = defineProps<{ activity: AdmissionActivity }>();
const emit = defineEmits<{
    save: [activity: AdmissionActivity];
    close: [];
}>();

// El padre monta una instancia nueva cada vez que abre el modal.
const form = ref<AdmissionActivity>(JSON.parse(JSON.stringify(props.activity)));
const title = props.activity.nombre ? 'Editar bloque' : 'Nuevo bloque';
const errorMessage = ref('');
const pendingReads = ref(0);
const reading = computed(() => pendingReads.value > 0);
const validType = computed(() => ACTIVITY_OPTIONS.some(option => option.value === form.value.tipo));
const canSave = computed(() => Boolean(form.value.nombre.trim()) && validType.value && !reading.value);

function cambiarActivityType(value: string | null): void {
    if (value === null || reading.value) return;
    if (!ACTIVITY_OPTIONS.some(option => option.value === value)) return;
    form.value.tipo = value;
}

function agregarDocumento(): void {
    form.value.documentos = [
        ...(form.value.documentos ?? []),
        { id: crypto.randomUUID(), nombre: '', obligatorio: true, descripcion: '' }
    ];
}

function cambiarTamanoMaximo(documento: AdmissionDocument, value: string | number | null): void {
    if (value === null || String(value).trim() === '') {
        documento.tamanoMaximo = null;
        return;
    }
    const size = Number(value);
    documento.tamanoMaximo = Number.isFinite(size) && size > 0 ? size : null;
}

function abrirDocumentTemplate(id: string): void {
    const input = document.getElementById(`template-${id}`);
    if (input instanceof HTMLInputElement) input.click();
}

async function cargarDocumentTemplate(documento: AdmissionDocument, event: Event): Promise<void> {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    pendingReads.value++;
    errorMessage.value = '';
    try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') resolve(reader.result);
                else reject(new Error('No se pudo leer el archivo.'));
            };
            reader.onerror = () => reject(reader.error);
            reader.onabort = () => reject(new Error('Lectura cancelada.'));
            reader.readAsDataURL(file);
        });
        documento.plantilla = { nombre: file.name, tipo: file.type, dataUrl };
    } catch {
        errorMessage.value = 'No se pudo leer la plantilla seleccionada.';
    } finally {
        pendingReads.value--;
        input.value = '';
    }
}

function guardarActivity(): void {
    if (!canSave.value) return;
    const result: AdmissionActivity = JSON.parse(JSON.stringify(form.value));
    result.nombre = result.nombre.trim();
    emit('save', result);
}
</script>

<template>
    <HeinrichModal
        :show="true"
        :title="title"
        primary-text="Guardar"
        :primary-disabled="!canSave"
        :loading="reading"
        persistent
        @confirm="guardarActivity"
        @cancel="emit('close')"
    >
        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4" @click:close="errorMessage = ''">
            {{ errorMessage }}
        </v-alert>

        <v-text-field v-model="form.nombre" label="Nombre del bloque *" />
        <v-select
            :model-value="form.tipo"
            :items="ACTIVITY_OPTIONS"
            item-title="title"
            item-value="value"
            label="Tipo de bloque *"
            :disabled="reading"
            @update:model-value="cambiarActivityType"
        />

        <template v-if="form.tipo === ACTIVITY_TYPES.RICH_TEXT">
            <label class="text-body-2 font-weight-medium d-block mb-2">Contenido</label>
            <HeinrichRichTextEditor v-model="form.richText" />
        </template>

        <template v-else-if="form.tipo === ACTIVITY_TYPES.DOCUMENT_UPLOAD">
            <v-textarea v-model="form.descripcion" label="Descripción / instrucciones" rows="2" auto-grow />
            <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2">Documentos esperados</span>
                <v-btn size="small" variant="tonal" color="primary" @click="agregarDocumento">Agregar documento</v-btn>
            </div>
            <v-card v-for="(document, index) in form.documentos ?? []" :key="document.id" variant="outlined" class="pa-3 mb-2">
                <v-text-field v-model="document.nombre" density="compact" label="Nombre" hide-details class="mb-2" />
                <v-text-field v-model="document.descripcion" density="compact" label="Descripción opcional" hide-details class="mb-2" />
                <v-row dense class="mb-1">
                    <v-col cols="12" md="5">
                        <v-text-field v-model="document.formatosPermitidos" density="compact" label="Formatos permitidos" placeholder="PDF, JPG, PNG" hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field
                            :model-value="document.tamanoMaximo == null ? '' : String(document.tamanoMaximo)"
                            density="compact" type="number" min="1" label="Tamaño máximo (MB)" hide-details
                            @update:model-value="cambiarTamanoMaximo(document, $event)"
                        />
                    </v-col>
                    <v-col cols="12" md="3" class="d-flex align-center">
                        <v-checkbox v-model="document.permitirReemplazo" density="compact" label="Permitir reemplazo" hide-details />
                    </v-col>
                </v-row>
                <div class="d-flex flex-wrap align-center ga-2 mb-2">
                    <v-btn size="small" class="mt-1" variant="outlined" prepend-icon="mdi-file-upload-outline" :disabled="reading" @click="abrirDocumentTemplate(document.id)">
                        {{ document.plantilla ? 'Cambiar plantilla' : 'Subir plantilla' }}
                    </v-btn>
                    <span v-if="document.plantilla" class="text-caption text-medium-emphasis">{{ document.plantilla.nombre }}</span>
                    <v-btn v-if="document.plantilla" size="x-small" variant="text" color="error" icon="mdi-close" :disabled="reading" @click="document.plantilla = undefined" />
                    <input :id="`template-${document.id}`" type="file" class="d-none" @change="cargarDocumentTemplate(document, $event)" />
                </div>
                <div class="d-flex align-center">
                    <v-checkbox v-model="document.obligatorio" label="Obligatorio" density="compact" hide-details />
                    <v-spacer />
                    <v-btn size="small" variant="text" color="error" icon="mdi-delete-outline" :disabled="reading" @click="form.documentos?.splice(index, 1)" />
                </div>
            </v-card>
        </template>

        <template v-else-if="form.tipo === ACTIVITY_TYPES.CONFIRMATION">
            <v-textarea v-model="form.descripcion" label="Descripción / instrucción" rows="2" auto-grow />
            <v-textarea v-model="form.textoConfirmacion" label="Texto de confirmación" rows="2" auto-grow />
            <v-text-field v-model="form.etiquetaConfirmacion" label="Etiqueta de confirmación" placeholder="Confirmo que la información es correcta" />
            <v-checkbox v-model="form.obligatorio" label="Confirmación obligatoria" hide-details />
        </template>

    </HeinrichModal>
</template>
