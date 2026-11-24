<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UiModal from '@/components/shared/UiModal.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichStatusChip from '@/components/heinrich/HeinrichStatusChip.vue';
import { type AdmissionStage, type Convocatoria, type TipoAlcance } from '@/mocks/convocatorias.mock';
import { getConvocatoria, nextConvocatoriaId, saveConvocatoria } from '../convocatorias.services';
import { resolveEstado } from '@/mocks/convocatorias.store';
import EtapasSection from '../components/EtapasSection.vue';
const route = useRoute();
const router = useRouter();
const existing = computed(() => (typeof route.params.id === 'string' ? getConvocatoria(route.params.id) : undefined));
const blank = (): Convocatoria => ({
    id: nextConvocatoriaId(),
    nombre: '',
    descripcion: '',
    anio: '',
    nivel: '',
    grado: '',
    tipoAlcance: 'nivel',
    apertura: '',
    cierre: '',
    registros: 0,
    cupos: 0,
    postulantes: 0,
    duracionReservaMinutos: 30,
    publicada: false,
    finalizada: false,
    estado: 'Borrador',
    etapas: []
});
const form = ref<Convocatoria>(existing.value ? JSON.parse(JSON.stringify(existing.value)) : blank());
const savedSnapshot = ref(JSON.stringify(form.value));
const submitted = ref(false);
const confirmLeave = ref(false);
const confirmPublish = ref(false);
const allowLeave = ref(false);
const message = ref('');
const editingStage = ref(false);
const levels = ['Inicial', 'Primaria', 'Secundaria'];
const grades: Record<string, string[]> = {
    Inicial: ['Inicial 3 años', 'Inicial 4 años', 'Kindergarten'],
    Primaria: ['1.º Primaria', '2.º Primaria', '3.º Primaria', '4.º Primaria', '5.º Primaria', '6.º Primaria'],
    Secundaria: ['1.º Secundaria', '2.º Secundaria', '3.º Secundaria', '4.º Secundaria', '5.º Secundaria']
};
const cycles = ['2026', '2027', '2028', '2029'];
const availableGrades = computed(() => grades[form.value.nivel] || []);
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value);
const status = computed(() => resolveEstado(form.value));
const errors = computed(() => ({
    nombre: !form.value.nombre.trim() ? 'El nombre de la convocatoria es obligatorio.' : '',
    anio: !form.value.anio ? 'Seleccione el ciclo académico.' : '',
    nivel: !form.value.nivel ? 'Seleccione el nivel educativo.' : '',
    grado: form.value.tipoAlcance === 'grado' && !form.value.grado ? 'Seleccione el grado.' : '',
    apertura: !form.value.apertura ? 'Ingrese la fecha y hora de apertura.' : '',
    cierre: !form.value.cierre
        ? 'Ingrese la fecha y hora de cierre.'
        : form.value.apertura && new Date(form.value.cierre) <= new Date(form.value.apertura)
          ? 'El cierre debe ser posterior al inicio.'
          : '',
    cupos: !Number.isInteger(Number(form.value.cupos)) || Number(form.value.cupos) <= 0 ? 'Ingrese un número entero positivo.' : '',
    reserva:
        !Number.isInteger(Number(form.value.duracionReservaMinutos)) || Number(form.value.duracionReservaMinutos) <= 0
            ? 'Ingrese un número entero positivo.'
            : ''
}));
const invalid = computed(() => Boolean(Object.values(errors.value).find(Boolean)));
watch(
    () => form.value.nivel,
    () => {
        if (!availableGrades.value.includes(form.value.grado)) form.value.grado = '';
    }
);
watch(
    () => form.value.tipoAlcance,
    (value: TipoAlcance) => {
        if (value === 'nivel') form.value.grado = '';
    }
);
function persist(publish = false) {
    submitted.value = true;
    if (invalid.value) return false;
    form.value.nombre = form.value.nombre.trim();
    if (publish) form.value.publicada = true;
    form.value.estado = resolveEstado(form.value);
    saveConvocatoria(form.value);
    savedSnapshot.value = JSON.stringify(form.value);
    message.value = publish ? 'Convocatoria publicada en modo demostración.' : 'Convocatoria guardada localmente.';
    return true;
}
function saveAndBack() {
    if (persist()) router.push({ name: 'admision-convocatorias' });
}
function publish() {
    if (!invalid.value) confirmPublish.value = true;
    else submitted.value = true;
}
function confirmPublication() {
    confirmPublish.value = false;
    if (persist(true)) router.push({ name: 'admision-convocatorias' });
}
function requestBack() {
    if (isDirty.value) confirmLeave.value = true;
    else router.push({ name: 'admision-convocatorias' });
}
function discard() {
    confirmLeave.value = false;
    allowLeave.value = true;
    router.push({ name: 'admision-convocatorias' });
}
function updateStages(stages: AdmissionStage[]) {
    form.value.etapas = stages;
}
onBeforeRouteLeave(() => {
    if (isDirty.value && !allowLeave.value) return window.confirm('Hay cambios sin guardar. ¿Desea descartarlos?');
});
</script>
<template>
    <HeinrichHeroBanner title="Admisión" subtitle="Administración del proceso de admisión" /><v-alert
        v-if="message"
        type="success"
        variant="tonal"
        closable
        class="mb-6"
        @click:close="message = ''"
        >{{ message }}</v-alert
    ><UiParentCard title="Datos generales" icon="mdi-file-document-outline" class="mb-6"
        ><template #action
            ><HeinrichStatusChip :status="status" size="small" /><v-btn color="primary" size="small" class="ms-3" @click="publish"
                >Publicar convocatoria</v-btn
            ></template
        >
        <div class="text-subtitle-2 mb-4">Identificación</div>
        <v-row
            ><v-col cols="12" md="7"
                ><v-text-field
                    v-model="form.nombre"
                    label="Nombre de convocatoria"
                    :error-messages="submitted ? errors.nombre : ''" /></v-col
            ><v-col cols="12" md="5"
                ><v-select
                    v-model="form.anio"
                    :items="cycles"
                    label="Ciclo académico"
                    :error-messages="submitted ? errors.anio : ''" /></v-col></v-row
        ><v-divider class="my-2" />
        <div class="text-subtitle-2 my-4">Alcance de convocatoria</div>
        <v-radio-group v-model="form.tipoAlcance" inline hide-details class="mb-2"
            ><v-radio label="Nivel completo" value="nivel" /><v-radio label="Grado específico" value="grado" /></v-radio-group
        ><v-row
            ><v-col cols="12" md="6"
                ><v-select
                    v-model="form.nivel"
                    :items="levels"
                    label="Nivel educativo"
                    :error-messages="submitted ? errors.nivel : ''" /></v-col
            ><v-col v-if="form.tipoAlcance === 'grado'" cols="12" md="6"
                ><v-select
                    v-model="form.grado"
                    :items="availableGrades"
                    label="Grado"
                    :disabled="!form.nivel"
                    :error-messages="submitted ? errors.grado : ''" /></v-col></v-row
        ><v-divider class="my-2" />
        <div class="text-subtitle-2 my-4">Información adicional</div>
        <v-textarea v-model="form.descripcion" label="Descripción" rows="3" auto-grow /><v-divider class="my-2" />
        <div class="text-subtitle-2 my-4">Control de acceso</div>
        <v-row
            ><v-col cols="12" md="6"
                ><v-text-field
                    v-model="form.apertura"
                    type="datetime-local"
                    label="Fecha y hora de apertura"
                    :error-messages="submitted ? errors.apertura : ''" /></v-col
            ><v-col cols="12" md="6"
                ><v-text-field
                    v-model="form.cierre"
                    type="datetime-local"
                    label="Fecha y hora de cierre"
                    :error-messages="submitted ? errors.cierre : ''" /></v-col
            ><v-col cols="12" md="6"
                ><v-text-field
                    v-model.number="form.cupos"
                    type="number"
                    min="1"
                    label="Cupos de registro"
                    :error-messages="submitted ? errors.cupos : ''" /></v-col
            ><v-col cols="12" md="6"
                ><v-text-field
                    v-model.number="form.duracionReservaMinutos"
                    type="number"
                    min="1"
                    suffix="minutos"
                    label="Duración de reserva temporal"
                    :error-messages="submitted ? errors.reserva : ''" /></v-col></v-row></UiParentCard
    ><UiParentCard title="Etapas" icon="mdi-format-list-numbered" class="mb-6"
        ><EtapasSection :convocatoria-id="form.id" :stages="form.etapas" @update:stages="updateStages" @editing-change="editingStage = $event"
    /></UiParentCard>
    <div v-if="!editingStage" class="d-flex flex-wrap justify-end ga-3">
        <v-btn variant="outlined" @click="requestBack">Cancelar</v-btn
        ><v-btn color="primary" @click="persist()">Guardar</v-btn>
    </div>
    <UiModal v-model:show="confirmLeave" title="Descartar cambios"
        ><p>Hay modificaciones sin guardar. ¿Desea descartarlas y volver al listado?</p>
        <template #footer-actions
            ><v-btn variant="text" @click="confirmLeave = false">Continuar editando</v-btn
            ><v-btn color="primary" @click="discard">Descartar cambios</v-btn></template
        ></UiModal
    ><UiModal v-model:show="confirmPublish" title="Publicar convocatoria" persistent
        ><p>Esta es una publicación de demostración: no habilita registros ni envía información a servicios externos.</p>
        <template #footer-actions
            ><v-btn variant="text" @click="confirmPublish = false">Cancelar</v-btn
            ><v-btn color="primary" @click="confirmPublication">Publicar</v-btn></template
        ></UiModal
    >
</template>
