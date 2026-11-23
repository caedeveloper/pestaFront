<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuSecciones from './MenuSecciones.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { useAuthStore } from '@/stores/auth';
import { 
    actividadesHijo,
    distritosLima,
    estadosCiviles,
    gradosInstruccion,
    idiomas,
    paises,
    relacionesTutor,
    religiones,
    sexos,
    tiposDocumento,
    tiposVia,
    tiposZona
} from '../postulantes.catalogos';
import { nombreCompleto } from '../postulantes.helpers';
import type { HijoRegistro } from '../postulantes.types';

const props = withDefaults(defineProps<{ entidad: 'tutor-principal' | 'tutor-segundo'; readonly?: boolean; embedded?: boolean }>(), { readonly: false, embedded: false });
const emit = defineEmits<{ volver: []; saved: [] }>();
const route = useRoute();
const router = useRouter();
const store = useRegistroPostulanteStore();
const authStore = useAuthStore();
const tutor = computed(() => store.tutorDe(props.entidad));
const nombre = computed(() => nombreCompleto(tutor.value));
const hijosActuales = computed(() => tutor.value.hijos.filter((hijo) => hijo.actualCompromiso));
const hijosOtros = computed(() => tutor.value.hijos.filter((hijo) => !hijo.actualCompromiso));
const secciones = computed(() => store.seccionesDe(props.entidad));
const tutorVinculado = ref(false);

watch(
    () => (props.entidad === 'tutor-principal' ? [tutor.value.nombres, tutor.value.apellidoPaterno] : null),
    () => {
        if (props.entidad !== 'tutor-principal') return;
        const tutorId = authStore.user?.tutorId;
        const esSuPerfil = !tutorId || tutorId === store.tutorPrincipalId;
        if (esSuPerfil) authStore.actualizarNombreDesdeTutor(tutor.value);
    }
);

async function guardar() {
    if (props.readonly) return;
    const asignarUsuario = !authStore.user?.tutorId;
    const seguirAlPostulante = route.name === 'postulante-tutor-responsable-nuevo';
    await store.guardarRegistro();
    if (asignarUsuario) authStore.asignarTutorActual(store.tutorPrincipalId, store.tutorPrincipal);
    if (seguirAlPostulante) {
        await router.push({ name: 'postulante-registro', params: { postulanteId: store.postulanteId } });
        return;
    }
    emit('saved');
    if (!props.embedded) emit('volver');
}

function buscarTutorPorDocumento() {
    if (props.entidad !== 'tutor-segundo') return;
    tutorVinculado.value = store.vincularTutorPorDocumento(props.entidad, tutor.value.documentoIdentidad);
}

function agregarHijo(actualCompromiso: boolean) {
    const hijo: HijoRegistro = {
        id: store.nuevoId(),
        nombre: '',
        fechaNacimiento: '',
        sexo: 'M',
        actividad: 'Ninguno',
        institucion: '',
        actualCompromiso
    };
    tutor.value.hijos.push(hijo);
}

function quitarHijo(id: number) {
    tutor.value.hijos = tutor.value.hijos.filter((hijo) => hijo.id !== id);
}
</script>

<template>
    <HeinrichHeroBanner v-if="!embedded" title="Actualización de datos" :subtitle="nombre" />
    <MenuSecciones v-if="!embedded" :secciones="secciones" />
    <v-form :class="{ 'formulario-solo-lectura': readonly }" @submit.prevent="guardar">
        <v-row>
            <v-col cols="12">
        <v-alert color="info" type="info" title="Guía para actualización de datos">
            Revise cada una de las secciones y complete los datos del padre de familia. Al finalizar, use Guardar y continuar para volver al resumen.
            Los datos permanecen en esta vista.
        </v-alert>

        <UiParentCard id="seccion-relacion" title="Relación familiar" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Relación familiar" v-model="tutor.relacionTutorId" :items="relacionesTutor" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="¿Tiene la custodia legal del postulante?" v-model="tutor.tieneCustodiaLegal" inline>
                        <v-radio label="Sí" :value="true" />
                        <v-radio label="No" :value="false" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="¿Vive con el postulante?" v-model="tutor.viveConPostulante" inline>
                        <v-radio label="Sí" :value="true" />
                        <v-radio label="No" :value="false" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="¿Desea que las boletas sean emitidas a este nombre?" v-model="tutor.responsablePago" inline>
                        <v-radio label="Sí" :value="true" />
                        <v-radio label="No" :value="false" />
                    </v-radio-group>
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-personales" title="1. Datos personales" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Apellido paterno" v-model="tutor.apellidoPaterno" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Apellido materno" v-model="tutor.apellidoMaterno" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombres" v-model="tutor.nombres" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="País de nacimiento" v-model="tutor.paisNacimientoId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="Nacionalidad" v-model="tutor.paisNacionalidadId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="Segunda nacionalidad" v-model="tutor.paisNacionalidad2Id" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Idioma materno" v-model="tutor.idiomaMaternoId" :items="idiomas" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Segundo idioma" v-model="tutor.idiomaSegundoId" :items="idiomas" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Fecha de nacimiento" type="date" v-model="tutor.fechaNacimiento" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Estado civil" v-model="tutor.estadoCivilId" :items="estadosCiviles" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="Sexo" v-model="tutor.sexo" inline>
                        <v-radio v-for="sexo in sexos" :key="sexo.id" :label="sexo.descripcion" :value="sexo.id" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Tipo de documento de identidad" v-model="tutor.tipoDocumentoIdentidadId" :items="tiposDocumento" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-text-field label="Número de documento de identidad" v-model="tutor.documentoIdentidad" @blur="buscarTutorPorDocumento" />
                    <div v-if="tutorVinculado" class="text-caption text-success mt-1">Datos del tutor existente cargados.</div>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Religión (opcional)" v-model="tutor.religionId" :items="religiones" item-title="descripcion" item-value="id" clearable />
                </v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-contacto" title="2. Datos de contacto" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Dirección de correo" v-model="tutor.correoElectronico" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Repetir dirección de correo" v-model="tutor.correoConfirmacion" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Dirección de correo alternativo" v-model="tutor.correoElectronico2" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Celular principal" v-model="tutor.telefonoCelular" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Celular secundario" v-model="tutor.telefonoCelular2" /></v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-domicilio" title="3. Datos del domicilio" class="mt-4">
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="País" v-model="tutor.domicilioPaisId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="¿Dentro de Lima?" v-model="tutor.dentroDeLima" inline>
                        <v-radio label="Sí" :value="true" />
                        <v-radio label="No" :value="false" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Teléfono principal" v-model="tutor.domicilioTelefono" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Teléfono alternativo" v-model="tutor.domicilioTelefono2" /></v-col>
                <template v-if="tutor.dentroDeLima">
                    <v-col cols="12" lg="4" md="4" sm="6"><v-select label="Tipo vía" v-model="tutor.tipoVia" :items="tiposVia" clearable /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombre vía" v-model="tutor.nombreVia" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Número/Manzana" v-model="tutor.numero" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-select label="Tipo zona" v-model="tutor.tipoZona" :items="tiposZona" clearable /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombre zona" v-model="tutor.nombreZona" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Interior/Lote/Dpto." v-model="tutor.interior" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Departamento/Ciudad" v-model="tutor.domicilioCiudad" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6">
                        <v-select label="Distrito" v-model="tutor.distritoId" :items="distritosLima" item-title="descripcion" item-value="id" clearable />
                    </v-col>
                </template>
                <template v-else-if="tutor.dentroDeLima === false">
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Dirección" v-model="tutor.domicilioDireccion" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Distrito" v-model="tutor.domicilioDistrito" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Ciudad" v-model="tutor.domicilioCiudad" /></v-col>
                </template>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-educacion" title="4. Datos de educación (opcional)" class="mt-4">
            <v-alert type="info" variant="tonal" density="compact" class="mb-4" text="Indicar el nombre de la institución en que realizó sus estudios." />
            <v-row>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-select label="Grado de instrucción" v-model="tutor.gradoInstruccionId" :items="gradosInstruccion" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="8" md="8">
                    <div class="d-flex flex-wrap align-center ga-4">
                        <v-radio-group label="¿Exalumno del Pestalozzi?" v-model="tutor.esExalumno" inline hide-details>
                            <v-radio label="Sí" :value="true" />
                            <v-radio label="No" :value="false" />
                        </v-radio-group>
                        <v-text-field v-if="tutor.esExalumno" label="Año de egreso" v-model="tutor.anioEgreso" style="max-width: 160px" />
                    </div>
                </v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Nombre de la institución de estudios primarios" v-model="tutor.institucionPrimaria" /></v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Nombre de la institución de estudios secundarios" v-model="tutor.institucionSecundaria" /></v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Nombre de la institución de estudios superiores" v-model="tutor.institucionSuperior" /></v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Título profesional o grado profesional" v-model="tutor.tituloProfesional" /></v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Nombre de la institución de estudios del último postgrado" v-model="tutor.institucionPostGrado" /></v-col>
                <v-col cols="12" lg="6" md="6"><v-text-field label="Título del último postgrado" v-model="tutor.tituloPostGrado" /></v-col>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-laboral" title="5. Datos del centro laboral" class="mt-4">
            <v-checkbox v-model="tutor.noLabora" hide-details class="mb-2">
                <template #label><span>Declaro que <u>no</u> realiza actividades laborales</span></template>
            </v-checkbox>
            <v-row v-if="!tutor.noLabora" class="mt-2">
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Cargo u ocupación" v-model="tutor.cargo" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Empresa" v-model="tutor.empresa" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-autocomplete label="País" v-model="tutor.trabajoPaisId" :items="paises" item-title="descripcion" item-value="id" clearable />
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6">
                    <v-radio-group label="¿Dentro de Lima?" v-model="tutor.trabajoDentroDeLima" inline>
                        <v-radio label="Sí" :value="true" />
                        <v-radio label="No" :value="false" />
                    </v-radio-group>
                </v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Teléfono principal" v-model="tutor.trabajoTelefono" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Anexo" v-model="tutor.trabajoAnexo" /></v-col>
                <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Fax" v-model="tutor.trabajoFax" /></v-col>
                <template v-if="tutor.trabajoDentroDeLima">
                    <v-col cols="12" lg="4" md="4" sm="6"><v-select label="Tipo vía" v-model="tutor.trabajoTipoVia" :items="tiposVia" clearable /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombre vía" v-model="tutor.trabajoNombreVia" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Número/Manzana" v-model="tutor.trabajoNumero" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-select label="Tipo zona" v-model="tutor.trabajoTipoZona" :items="tiposZona" clearable /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Nombre zona" v-model="tutor.trabajoNombreZona" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Interior/Lote/Dpto." v-model="tutor.trabajoInterior" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Departamento/Ciudad" v-model="tutor.trabajoCiudad" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6">
                        <v-select label="Distrito" v-model="tutor.trabajoDistritoId" :items="distritosLima" item-title="descripcion" item-value="id" clearable />
                    </v-col>
                </template>
                <template v-else-if="tutor.trabajoDentroDeLima === false">
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Dirección" v-model="tutor.trabajoDireccion" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Distrito" v-model="tutor.trabajoDistrito" /></v-col>
                    <v-col cols="12" lg="4" md="4" sm="6"><v-text-field label="Ciudad" v-model="tutor.trabajoCiudad" /></v-col>
                </template>
            </v-row>
        </UiParentCard>

        <UiParentCard id="seccion-hijos" title="6. Hijos" class="mt-4">
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                Indicar todos los hijos que usted tenga, sin incluir al postulante, pero incluyendo a los hijos de otros compromisos en caso aplique.
            </v-alert>
            <h3 class="text-title-medium mb-3">6.1 Del compromiso actual</h3>
            <v-table v-if="hijosActuales.length" density="comfortable" class="mb-3">
                <thead>
                    <tr>
                        <th>Nombres y apellidos</th>
                        <th>Fecha nac.</th>
                        <th>Sexo</th>
                        <th>Actividad</th>
                        <th>¿En dónde?</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="hijo in hijosActuales" :key="hijo.id">
                        <td><v-text-field v-model="hijo.nombre" hide-details density="compact" /></td>
                        <td><v-text-field v-model="hijo.fechaNacimiento" type="date" hide-details density="compact" /></td>
                        <td style="min-width: 150px">
                            <v-radio-group v-model="hijo.sexo" inline hide-details>
                                <v-radio label="M" value="M" />
                                <v-radio label="F" value="F" />
                            </v-radio-group>
                        </td>
                        <td style="min-width: 150px"><v-select v-model="hijo.actividad" :items="actividadesHijo" hide-details density="compact" /></td>
                        <td><v-text-field v-model="hijo.institucion" hide-details density="compact" /></td>
                        <td class="text-right"><v-btn icon variant="tonal" color="primary" density="compact" aria-label="Quitar hijo" @click="quitarHijo(hijo.id)"><v-icon>mdi-trash-can-outline</v-icon></v-btn></td>
                    </tr>
                </tbody>
            </v-table>
            <v-btn color="primary" variant="tonal" class="mb-6" @click="agregarHijo(true)"><v-icon start>mdi-plus</v-icon>Agregar</v-btn>

            <h3 class="text-title-medium mb-3">6.2 De otros compromisos (opcional)</h3>
            <v-table v-if="hijosOtros.length" density="comfortable" class="mb-3">
                <thead>
                    <tr>
                        <th>Nombres y apellidos</th>
                        <th>Fecha nac.</th>
                        <th>Sexo</th>
                        <th>Actividad</th>
                        <th>¿En dónde?</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="hijo in hijosOtros" :key="hijo.id">
                        <td><v-text-field v-model="hijo.nombre" hide-details density="compact" /></td>
                        <td><v-text-field v-model="hijo.fechaNacimiento" type="date" hide-details density="compact" /></td>
                        <td style="min-width: 150px">
                            <v-radio-group v-model="hijo.sexo" inline hide-details>
                                <v-radio label="M" value="M" />
                                <v-radio label="F" value="F" />
                            </v-radio-group>
                        </td>
                        <td style="min-width: 150px"><v-select v-model="hijo.actividad" :items="actividadesHijo" hide-details density="compact" /></td>
                        <td><v-text-field v-model="hijo.institucion" hide-details density="compact" /></td>
                        <td class="text-right"><v-btn icon variant="tonal" color="primary" density="compact" aria-label="Quitar hijo" @click="quitarHijo(hijo.id)"><v-icon>mdi-trash-can-outline</v-icon></v-btn></td>
                    </tr>
                </tbody>
            </v-table>
            <v-btn color="primary" variant="tonal" @click="agregarHijo(false)"><v-icon start>mdi-plus</v-icon>Agregar</v-btn>
        </UiParentCard>

        <UiParentCard id="seccion-reglamentos" title="7. Reglamentos y políticas de privacidad" class="mt-4">
            <v-alert type="info" variant="tonal" density="compact" class="mb-4" text="Deberá aceptar todos los consentimientos para continuar." />
            <template v-if="tutor.esTitular">
                <v-checkbox v-model="tutor.aceptaNormas" hide-details label="Tengo conocimiento de las normas del Reglamento del Proceso de Admisión actual." />
                <v-checkbox v-model="tutor.aceptaReglamentos" hide-details label="Tengo conocimiento de los Reglamentos y Proyecto Educativo actuales." />
                <v-checkbox v-model="tutor.aceptaPolitica" hide-details label="He leído y acepto la Política de Privacidad para el Proceso de Admisión de la Asociación Colegio Pestalozzi." />
                <v-checkbox v-model="tutor.aceptaPerfil" hide-details label="Tengo conocimiento del Perfil de Alumno." />
            </template>
            <v-checkbox
                v-else
                v-model="tutor.aceptaPolitica"
                hide-details
                label="Aseguro contar con la autorización expresa y plena del otro padre, madre o tutor legal del postulante para proporcionar sus datos personales, según la Política de Privacidad del Proceso de Admisión."
            />
        </UiParentCard>

        <v-card v-if="!embedded && !readonly" elevation="10" class="mt-4">
            <v-card-text>
                <div class="text-center">
                    <v-btn variant="outlined" color="primary" size="large" class="mt-2 me-2" @click="emit('volver')">Volver al resumen</v-btn>
                    <v-btn type="submit" color="primary" size="large" class="mt-2" prepend-icon="mdi-content-save">Guardar y continuar</v-btn>
                </div>
            </v-card-text>
        </v-card>
            </v-col>
        </v-row>
    </v-form>
</template>
<style scoped>.formulario-solo-lectura { pointer-events: none; opacity: .78; }</style>
