<script setup lang="ts">
import { computed, ref } from 'vue';
import { DotsVerticalIcon, PlusIcon } from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichDataTable, { type HeinrichColumn } from '@/components/heinrich/HeinrichDataTable.vue';
import HeinrichStatusChip from '@/components/heinrich/HeinrichStatusChip.vue';
import { convocatoriasMock, type Convocatoria, type ConvocatoriaEstado } from '../convocatorias.mock';

const anio = ref<string | null>(null), grado = ref<string | null>(null), estado = ref<ConvocatoriaEstado | null>(null), nombre = ref('');
const submitted = ref({ anio: null as string | null, grado: null as string | null, estado: null as ConvocatoriaEstado | null, nombre: '' });
const anios = [...new Set(convocatoriasMock.map(x => x.anio))];
const grados = [...new Set(convocatoriasMock.map(x => x.grado))];
const estados: ConvocatoriaEstado[] = ['Borrador', 'Programada', 'Abierta', 'Cerrada', 'Finalizada'];
const columns: HeinrichColumn<Convocatoria>[] = [
  { key: 'nombre', title: 'Convocatoria', sortable: true, width: '25%' }, { key: 'anio', title: 'Año académico', sortable: true, sortType: 'number' },
  { key: 'grado', title: 'Nivel / grado', sortable: true }, { key: 'apertura', title: 'Fecha de apertura', sortable: true, sortType: 'date' },
  { key: 'cierre', title: 'Fecha de cierre', sortable: true, sortType: 'date' }, { key: 'cupos', title: 'Cupos', align: 'center' },
  { key: 'postulantes', title: 'Inscritos', sortable: true, sortType: 'number', align: 'center' }, { key: 'estado', title: 'Estado', sortable: true, align: 'center' },
  { key: 'id', title: 'Acciones', align: 'center', width: '76px' }
];
const filtered = computed(() => convocatoriasMock.filter(x => (!submitted.value.anio || x.anio === submitted.value.anio) && (!submitted.value.grado || x.grado === submitted.value.grado) && (!submitted.value.estado || x.estado === submitted.value.estado) && (!submitted.value.nombre || `${x.nombre} ${x.descripcion || ''}`.toLocaleLowerCase().includes(submitted.value.nombre.toLocaleLowerCase()))));
function buscar() { submitted.value = { anio: anio.value, grado: grado.value, estado: estado.value, nombre: nombre.value.trim() }; }
function limpiar() { anio.value = grado.value = estado.value = null; nombre.value = ''; buscar(); }
</script>
<template>
  <HeinrichHeroBanner title="Admisión" subtitle="Administración de convocatorias" />
  <div class="d-flex justify-end mb-6 mt-n3">
    <v-tooltip text="La creación de convocatorias estará disponible próximamente.">
      <template #activator="{ props }">
        <span v-bind="props">
          <v-btn color="primary" :prepend-icon="PlusIcon" disabled>Nueva convocatoria</v-btn>
        </span>
      </template>
    </v-tooltip>
  </div>
  <UiParentCard title="Filtros" icon="mdi-filter-variant" class="mb-6">
    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-text-field v-model="nombre" label="Nombre de convocatoria" hide-details clearable @keyup.enter="buscar" />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-select v-model="anio" :items="anios" label="Año académico" hide-details clearable />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-select v-model="grado" :items="grados" label="Nivel / grado" hide-details clearable />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-select v-model="estado" :items="estados" label="Estado" hide-details clearable />
      </v-col>
      <v-col cols="12" class="d-flex align-center justify-end ga-3 pt-0">
        <v-btn variant="text" @click="limpiar">Limpiar</v-btn>
        <v-btn color="primary" @click="buscar">Buscar</v-btn>
      </v-col>
    </v-row>
  </UiParentCard>
  <UiParentCard title="Convocatorias registradas" icon="mdi-calendar-text-outline">
    <HeinrichDataTable :columns="columns" :rows="filtered" row-key="id">
      <template #item-nombre="{ item }">
        <div class="font-weight-medium">{{ item.nombre }}</div>
        <div v-if="item.descripcion" class="text-body-small text-medium-emphasis">{{ item.descripcion }}</div>
      </template>
      <template #item-cupos="{ item }">
        {{ item.registros }} / {{ item.cupos }}
      </template>
      <template #item-estado="{ item }"><HeinrichStatusChip :status="item.estado" /></template>
      <template #item-id>
        <v-menu>
          <template #activator="{ props }">
            <v-tooltip text="Ver detalle">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps"><v-btn v-bind="props" icon variant="text" size="small" aria-label="Acciones de la convocatoria"><DotsVerticalIcon size="20" /></v-btn></span>
              </template>
            </v-tooltip>
          </template>
          <v-list density="compact">
            <v-list-item title="Configurar" subtitle="Próximamente" disabled />
            <v-list-item title="Ver postulaciones" subtitle="Próximamente" disabled />
          </v-list>
        </v-menu>
      </template>
    </HeinrichDataTable>
  </UiParentCard>
</template>
