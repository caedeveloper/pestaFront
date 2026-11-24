<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    onBeforeRouteLeave,
    onBeforeRouteUpdate,
    useRoute,
    useRouter
} from 'vue-router';

import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichModal from '@/components/heinrich/HeinrichModal.vue';

import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichStatusChip from '@/components/heinrich/HeinrichStatusChip.vue';
import SectionConfigurarStage from '../components/SectionConfigurarStage.vue';
import useAdmissionCallsService from '../admission-calls.services';

import { SCOPE_TYPES } from '../admission-calls.constants';

import {
    crearAdmissionCallVacia,
    validarAdmissionCallForm
} from '../admission-calls.helpers';

import type {
    AdmissionCall,
    AdmissionStage,
    CatalogItem
} from '../admission-calls.types';

const route = useRoute();
const router = useRouter();
const service = useAdmissionCallsService();

// #region State

const form = ref<AdmissionCall | null>(null);

const loading = ref(true);
const saving = ref(false);
const loadingGrades = ref(false);

const submitted = ref(false);
const editingStage = ref(false);

const confirmLeave = ref(false);
const confirmPublish = ref(false);
const allowLeave = ref(false);

const message = ref('');
const errorMessage = ref('');
const gradeError = ref('');

const savedSnapshot = ref('');

let loadRequestId = 0;
let gradeRequestId = 0;

// #endregion

// #region Catalogs

const cycles = ref<CatalogItem[]>([]);
const levels = ref<CatalogItem[]>([]);
const statuses = ref<CatalogItem[]>([]);
const availableGrades = ref<CatalogItem[]>([]);

function cambiarEstado(value: string | null): void {
    if (!form.value || !value) return;

    form.value.estado = value;
    form.value.estadoManual = true;
}

async function cargarGrados(
    nivel: string
): Promise<void> {

    const requestId = ++gradeRequestId;

    availableGrades.value = [];
    gradeError.value = '';

    if (!nivel) {
        loadingGrades.value = false;
        return;
    }

    loadingGrades.value = true;

    try {
        const result = await service.obtenerGrades(nivel);

        if (requestId === gradeRequestId) {
            availableGrades.value = result;
        }

    } catch {

        if (requestId === gradeRequestId) {
            gradeError.value =
                'No se pudieron obtener los grados.';
        }

    } finally {

        if (requestId === gradeRequestId) {
            loadingGrades.value = false;
        }
    }
}

function cambiarNivel(value: string | null): void {

    if (!form.value) return;

    form.value.nivel = value ?? '';
    form.value.grado = '';

    void cargarGrados(form.value.nivel);
}

function cambiarScope(value: string | null): void {

    if (!form.value || value === null) return;

    if (
        value !== SCOPE_TYPES.LEVEL &&
        value !== SCOPE_TYPES.GRADE
    ) {
        return;
    }

    form.value.tipoAlcance = value;

    if (value === SCOPE_TYPES.LEVEL) {
        form.value.grado = '';
    }
}

// #endregion

// #region Computed

const isDirty = computed(() =>
    form.value !== null &&
    JSON.stringify(form.value) !== savedSnapshot.value
);

const errors = computed(() =>
    form.value
        ? validarAdmissionCallForm(form.value)
        : undefined
);

const invalid = computed(() =>
    !errors.value ||
    Object.values(errors.value).some(Boolean)
);

const saveDisabled = computed(() =>
    loading.value ||
    saving.value ||
    editingStage.value ||
    (
        form.value?.tipoAlcance === SCOPE_TYPES.GRADE &&
        (loadingGrades.value || Boolean(gradeError.value))
    )
);

// #endregion

// #region Initialization

async function cargarAdmissionCall(): Promise<void> {

    const requestId = ++loadRequestId;

    ++gradeRequestId;

    loading.value = true;
    loadingGrades.value = false;

    form.value = null;
    submitted.value = false;
    editingStage.value = false;

    message.value = '';
    errorMessage.value = '';
    gradeError.value = '';
    savedSnapshot.value = '';

    availableGrades.value = [];

    try {

        const id =
            typeof route.params.id === 'string'
                ? route.params.id
                : undefined;

        const [
            academicYears,
            educationLevels,
            admissionStatuses,
            admissionCall
        ] = await Promise.all([
            service.obtenerAcademicYears(),
            service.obtenerLevels(),
            service.obtenerStatuses(),

            id
                ? service.obtenerAdmissionCall(id)
                : service.generarAdmissionCallId()
                    .then(crearAdmissionCallVacia)
        ]);

        if (requestId !== loadRequestId) return;

        if (!admissionCall) {
            errorMessage.value =
                'No se encontró la convocatoria solicitada.';

            return;
        }

        cycles.value = academicYears;
        levels.value = educationLevels;
        statuses.value = admissionStatuses;

        form.value = JSON.parse(
            JSON.stringify(admissionCall)
        );

        savedSnapshot.value = JSON.stringify(form.value);

        await cargarGrados(admissionCall.nivel);

    } catch {

        if (requestId === loadRequestId) {
            errorMessage.value =
                'No se pudo cargar la convocatoria.';
        }

    } finally {

        if (requestId === loadRequestId) {
            loading.value = false;
        }
    }
}

// #endregion

// #region Operations

async function guardarAdmissionCall(
    publicar = false
): Promise<boolean> {

    if (!form.value || saveDisabled.value) {
        return false;
    }

    submitted.value = true;

    if (invalid.value) {
        return false;
    }

    saving.value = true;

    message.value = '';
    errorMessage.value = '';

    try {

        const item: AdmissionCall = JSON.parse(
            JSON.stringify(form.value)
        );

        item.nombre = item.nombre.trim();

        item.cupos = Number(item.cupos);

        item.duracionReservaMinutos =
            Number(item.duracionReservaMinutos);

        if (publicar) {
            item.publicada = true;
            item.finalizada = false;
            item.estadoManual = false;
        }

        const result =
            await service.guardarAdmissionCall(item);

        form.value = result;

        savedSnapshot.value = JSON.stringify(
            form.value
        );

        submitted.value = false;

        message.value = publicar
            ? 'Convocatoria publicada en modo demostración.'
            : 'Convocatoria guardada correctamente.';

        return true;

    } catch {

        errorMessage.value = publicar
            ? 'No se pudo publicar la convocatoria.'
            : 'No se pudo guardar la convocatoria.';

        return false;

    } finally {

        saving.value = false;
    }
}

function publicarAdmissionCall(): void {

    if (saveDisabled.value) return;

    submitted.value = true;

    if (invalid.value) return;

    confirmPublish.value = true;
}

async function confirmarPublicacionAdmissionCall(): Promise<void> {
    const saved = await guardarAdmissionCall(true);

    if (saved) {
        confirmPublish.value = false;
        await router.push({
            name: 'admision-convocatorias'
        });
    }
}

// #endregion

// #region Stages

function actualizarStages(
    stages: AdmissionStage[]
): void {

    if (!form.value) return;

    form.value.etapas = stages;
}

// #endregion

// #region Navigation

function solicitarRetornoAdmissionCall(): void {

    if (saving.value) return;

    if (isDirty.value) {

        confirmLeave.value = true;

        return;
    }

    void router.push({
        name: 'admision-convocatorias'
    });
}

async function descartarAdmissionCall(): Promise<void> {

    confirmLeave.value = false;
    allowLeave.value = true;

    try {

        await router.push({
            name: 'admision-convocatorias'
        });

    } finally {

        allowLeave.value = false;
    }
}

function validarSalida(): boolean {

    if (saving.value) {
        return false;
    }

    if (isDirty.value && !allowLeave.value) {
        return window.confirm(
            'Hay cambios sin guardar. ¿Desea descartarlos?'
        );
    }

    return true;
}

onBeforeRouteLeave(validarSalida);

onBeforeRouteUpdate((to, from) => {

    if (to.params.id === from.params.id) {
        return true;
    }

    return validarSalida();
});

// #endregion

// #region Watchers

watch(
    () => route.params.id,
    () => {
        void cargarAdmissionCall();
    },
    {
        immediate: true
    }
);

// #endregion
</script>

<template>
    <HeinrichHeroBanner title="Admisión" subtitle="Administración del proceso de admisión" />

    <v-alert v-if="message" type="success" variant="tonal" closable class="mb-6" @click:close="message = ''">
        {{ message }}
    </v-alert>

    <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-6" @click:close="errorMessage = ''">
        {{ errorMessage }}
    </v-alert>

    <!-- Loading -->

    <UiParentCard v-if="loading" title="Datos generales" icon="mdi-file-document-outline" class="mb-6">
        <div class="d-flex justify-center align-center pa-8">
            <v-progress-circular indeterminate color="primary" />
        </div>
    </UiParentCard>

    <!-- AdmissionCall form -->

    <template v-else-if="form">

        <UiParentCard title="Datos generales" icon="mdi-file-document-outline" class="mb-6"
            :inert="saving || undefined">
            <template #action>

                <HeinrichStatusChip :status="form.estado" size="small" />

                <v-btn color="primary" size="small" class="ms-3" :disabled="saveDisabled"
                    @click="publicarAdmissionCall">
                    Publicar convocatoria
                </v-btn>

            </template>

            <!-- Identificación -->

            <div class="text-subtitle-2 mb-4">
                Identificación
            </div>

            <v-row>
                <v-col cols="12" md="7">

                    <v-text-field v-model="form.nombre" label="Nombre de convocatoria" :error-messages="submitted ? errors?.nombre : ''
                        " />

                </v-col>

                <v-col cols="12" md="5">

                    <v-select v-model="form.anio" :items="cycles" item-title="nombre" item-value="codigo"
                        label="Ciclo académico" :error-messages="submitted ? errors?.anio : ''
                            " />

                </v-col>
            </v-row>

            <v-row v-if="route.params.id">
                <v-col cols="12" md="5">
                    <v-select :model-value="form.estado" :items="statuses" item-title="nombre" item-value="codigo"
                        label="Estado del proceso" @update:model-value="cambiarEstado" />
                </v-col>
            </v-row>

            <v-divider class="my-2" />

            <!-- Alcance -->

            <div class="text-subtitle-2 my-4">
                Alcance de convocatoria
            </div>

            <v-radio-group :model-value="form.tipoAlcance" inline hide-details class="mb-2"
                @update:model-value="cambiarScope">
                <v-radio label="Nivel completo" :value="SCOPE_TYPES.LEVEL" />

                <v-radio label="Grado específico" :value="SCOPE_TYPES.GRADE" />
            </v-radio-group>

            <v-row>
                <v-col cols="12" md="6">

                    <v-select :model-value="form.nivel" :items="levels" item-title="nombre" item-value="codigo"
                        label="Nivel educativo" :error-messages="submitted ? errors?.nivel : ''
                            " @update:model-value="cambiarNivel" />

                </v-col>

                <v-col v-if="form.tipoAlcance === SCOPE_TYPES.GRADE" cols="12" md="6">

                    <v-select v-model="form.grado" :items="availableGrades" item-title="nombre" item-value="codigo"
                        label="Grado" :loading="loadingGrades" :disabled="!form.nivel || loadingGrades" :error-messages="gradeError ||
                            (submitted ? errors?.grado : '')
                            " />

                    <v-btn v-if="gradeError" variant="text" size="small" @click="cargarGrados(form.nivel)">
                        Reintentar
                    </v-btn>

                </v-col>
            </v-row>

            <v-divider class="my-2" />

            <!-- Información adicional -->

            <div class="text-subtitle-2 my-4">
                Información adicional
            </div>

            <v-textarea v-model="form.descripcion" label="Descripción" rows="3" auto-grow />

            <v-divider class="my-2" />

            <!-- Control de acceso -->

            <div class="text-subtitle-2 my-4">
                Control de acceso
            </div>

            <v-row>
                <v-col cols="12" md="6">

                    <v-text-field v-model="form.apertura" type="datetime-local" label="Fecha y hora de apertura"
                        :error-messages="submitted ? errors?.apertura : ''
                            " />

                </v-col>

                <v-col cols="12" md="6">

                    <v-text-field v-model="form.cierre" type="datetime-local" label="Fecha y hora de cierre"
                        :error-messages="submitted ? errors?.cierre : ''
                            " />

                </v-col>

                <v-col cols="12" md="6">

                    <v-text-field v-model.number="form.cupos" type="number" min="1" label="Cupos de registro"
                        :error-messages="submitted ? errors?.cupos : ''
                            " />

                </v-col>

                <v-col cols="12" md="6">

                    <v-text-field v-model.number="form.duracionReservaMinutos" type="number" min="1" suffix="minutos"
                        label="Duración de reserva temporal" :error-messages="submitted ? errors?.reserva : ''
                            " />

                </v-col>
            </v-row>

        </UiParentCard>

        <!-- Stages -->

        <UiParentCard title="Etapas" icon="mdi-format-list-numbered" class="mb-6" :inert="saving || undefined">
            <SectionConfigurarStage :convocatoria-id="form.id" :stages="form.etapas" @update:stages="actualizarStages"
                @editing-change="editingStage = $event" />
        </UiParentCard>

        <!-- Actions -->

        <div v-if="!editingStage" class="d-flex flex-wrap justify-end ga-3">
            <v-btn variant="outlined" :disabled="saving" @click="solicitarRetornoAdmissionCall">
                Cancelar
            </v-btn>

            <v-btn color="primary" :loading="saving" :disabled="saveDisabled" @click="guardarAdmissionCall()">
                Guardar
            </v-btn>
        </div>

    </template>

    <!-- Initialization error -->

    <div v-else class="d-flex justify-end ga-3">
        <v-btn variant="outlined" @click="solicitarRetornoAdmissionCall">
            Volver
        </v-btn>

        <v-btn color="primary" @click="cargarAdmissionCall">
            Reintentar
        </v-btn>
    </div>

    <!-- Confirm leave -->

    <HeinrichModal
        v-model:show="confirmLeave"
        title="Descartar cambios"
        :width="500"
        primary-text="Descartar cambios"
        primary-icon=""
        primary-color="error"
        cancel-text="Continuar editando"
        @confirm="descartarAdmissionCall"
    >
        <p>
            Hay modificaciones sin guardar.
            ¿Desea descartarlas y volver al listado?
        </p>

    </HeinrichModal>

    <!-- Confirm publication -->

    <HeinrichModal
        v-model:show="confirmPublish"
        title="Publicar convocatoria"
        :width="500"
        primary-text="Publicar"
        primary-icon="mdi-publish"
        :loading="saving"
        persistent
        @confirm="confirmarPublicacionAdmissionCall"
    >
        <p>
            Esta es una publicación de demostración:
            no habilita registros ni envía información
            a servicios externos.
        </p>

    </HeinrichModal>
</template>
