<script setup lang="ts">
import { computed, watch } from 'vue';
import MenuSecciones from './MenuSecciones.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { 
    acercaDePadres,
    ciclos,
    custodiaOpciones,
    grados,
    idiomas,
    nidos,
    paises,
    religiones,
    sexos,
    situacionesPadres,
    tiposDocumento,
    tiposProcedencia,
    viveConOpciones
} from '../postulantes.catalogos';
import { asegurarReferencias, nombreCompleto, referenciaVacia } from '../postulantes.helpers';

const emit = defineEmits<{ volver: [] }>();
const store = useRegistroPostulanteStore();
const postulante = computed(() => store.postulante);
const nombre = computed(() => nombreCompleto(postulante.value));
const secciones = computed(() => store.seccionesDelPostulante);
watch(() => store.postulante, (actual) => asegurarReferencias(actual), { immediate: true });

function agregarReferencia() {
    postulante.value.referencias.push(referenciaVacia(store.nuevoId()));
}

function quitarReferencia(id: number) {
    if (postulante.value.referencias.length <= 1) return;
    postulante.value.referencias = postulante.value.referencias.filter((referencia) => referencia.id !== id);
}

async function guardar() {
    await store.guardarRegistro();
    emit('volver');
}
</script>

<template>
    <HeinrichHeroBanner title="Actualización de datos" :subtitle="nombre" />
    <MenuSecciones :secciones="secciones" />
    <v-form @submit.prevent="guardar">
        <v-row>
            <v-col cols="12">
        <v-alert color="info" type="info" title="Guía para actualización de datos">
            Revise cada una de las secciones y complete los datos del postulante. Al finalizar, use Guardar datos para volver al resumen.
            Los datos permanecen en esta vista.
        </v-alert>

        <UiParentCard id="seccion-generales" title="1. Datos generales del postulante" class="mt-4">
            <v-alert type="info" variant="tonal" density="compact" class="mb-4" text="Registre al postulante con los datos del proceso de admisión." />
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Apellido Paterno" v-model="postulante.apellidoPaterno" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Apellido Materno" v-model="postulante.apellidoMaterno" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombres" v-model="postulante.nombres" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Fecha de nacimiento" type="date" v-model="postulante.fechaNacimiento" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="Sexo" v-model="postulante.sexo" inline>
                        <v-radio v-for="sexo in sexos" :key="sexo.id" :label="sexo.descripcion" :value="sexo.id" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Religión (opcional)" v-model="postulante.religionId" :items="religiones" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Tipo de documento de identidad" v-model="postulante.tipoDocumentoIdentidadId" :items="tiposDocumento" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Número de documento de identidad" v-model="postulante.documentoIdentidad" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="País de nacimiento" v-model="postulante.paisNacimientoId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="Nacionalidad" v-model="postulante.paisNacionalidadId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="Segunda nacionalidad" v-model="postulante.paisNacionalidad2Id" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Situación actual entre los padres" v-model="postulante.situacionPadresId" :items="situacionesPadres" item-title="descripcion" item-value="id" clearable />
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-adicionales" title="2. Datos adicionales" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Tipo de procedencia académica" v-model="postulante.tipoProcedencia" :items="tiposProcedencia" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-combobox v-if="postulante.tipoProcedencia === 'Nido'" label="Nombre de la institución" v-model="postulante.procedenciaAcademica" :items="nidos" clearable />
                    <v-text-field v-else label="Nombre de la institución" v-model="postulante.procedenciaAcademica" />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Grado a ser matriculado" v-model="postulante.gradoMatriculaId" :items="grados" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Año escolar a ser matriculado" v-model="postulante.cicloEducativoMatriculaId" :items="ciclos" item-title="descripcion" item-value="id" />
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-familiar" title="3. Situación familiar (opcional)" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Acerca de los padres" v-model="postulante.acercaDePadres" :items="acercaDePadres" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="¿El postulante vive con?" v-model="postulante.estudianteViveCon" :items="viveConOpciones" item-title="descripcion" item-value="id" clearable />
                    <v-text-field v-if="postulante.estudianteViveCon === 'OT'" class="mt-3" label="Especifique" v-model="postulante.estudianteViveConOtro" />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="¿La custodia legal la posee?" v-model="postulante.estudianteCustodia" :items="custodiaOpciones" item-title="descripcion" item-value="id" clearable />
                    <v-text-field v-if="postulante.estudianteCustodia === 'OT'" class="mt-3" label="Especifique" v-model="postulante.estudianteCustodiaOtro" />
                </v-col>
                <v-col cols="12">
                    <v-textarea label="Si tiene algún dato adicional acerca de la situación familiar del postulante, por favor, especificar (máximo 200 caracteres)" v-model="postulante.situacionFamiliarDetalle" maxlength="200" counter="200" rows="3" />
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-idiomas" title="4. Idiomas" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Idioma principal que se habla en casa" v-model="postulante.idiomaCasaId" :items="idiomas" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Segundo idioma que se habla en casa" v-model="postulante.segundoIdiomaCasaId" :items="idiomas" item-title="descripcion" item-value="id" clearable />
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-referencias" title="5. Referencias" class="mt-4">
            <div v-for="(referencia, indice) in postulante.referencias" :key="referencia.id" class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                    <h3 class="text-title-medium">Referencia N° {{ indice + 1 }}</h3>
                    <v-btn v-if="postulante.referencias.length > 1" icon variant="tonal" color="primary" density="compact" aria-label="Quitar referencia" @click="quitarReferencia(referencia.id)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
                </div>
                <v-row>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombre de referencia" v-model="referencia.nombre" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Relación con el colegio" v-model="referencia.relacion" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Teléfono" v-model="referencia.telefono" /></v-col>
                </v-row>
            </div>
            <v-btn color="primary" variant="tonal" @click="agregarReferencia"><v-icon start>mdi-plus</v-icon>Agregar</v-btn>
        </UiParentCard>

        <v-card elevation="10" class="mt-4">
            <v-card-text>
                <div class="text-center">
                    <v-btn variant="outlined" color="primary" size="large" class="mt-2 me-2" @click="emit('volver')">Volver al resumen</v-btn>
                    <v-btn type="submit" color="primary" size="large" class="mt-2" prepend-icon="mdi-content-save">Guardar datos</v-btn>
                </div>
            </v-card-text>
        </v-card>
            </v-col>
        </v-row>
    </v-form>
</template>
