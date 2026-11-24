<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DotsVerticalIcon, PlusIcon } from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichDataTable, { type HeinrichColumn } from '@/components/heinrich/HeinrichDataTable.vue';
import HeinrichFilterCard from '@/components/heinrich/filters/HeinrichFilterCard.vue';
import { defineFilters, type FilterValues } from '@/components/heinrich/filters/filter.types';
import HeinrichStatusChip from '@/components/heinrich/HeinrichStatusChip.vue';
import { type Convocatoria, type ConvocatoriaEstado } from '@/mocks/convocatorias.mock';
import { convocatorias } from '../convocatorias.services';

const submitted = ref({ anio: null as string | null, grado: null as string | null, estado: null as ConvocatoriaEstado | null, nombre: '' });
const router = useRouter();
const anios = computed(() => [...new Set(convocatorias.value.map(x => x.anio))]);
const grados = computed(() => [...new Set(convocatorias.value.map(x => x.grado))]);
const estados: ConvocatoriaEstado[] = ['Borrador', 'Programada', 'Abierta', 'Cerrada', 'Finalizada'];
const filterModel = computed(() => defineFilters({
  nombre: { type: 'text', label: 'Nombre de convocatoria', defaultValue: '', cols: 12, md: 6, lg: 3 },
  anio: { type: 'select', label: 'Año académico', items: anios.value, cols: 12, md: 6, lg: 3 },
  grado: { type: 'select', label: 'Nivel / grado', items: grados.value, cols: 12, md: 6, lg: 3 },
  estado: { type: 'select', label: 'Estado', items: estados, cols: 12, md: 6, lg: 3 }
}));
const columns: HeinrichColumn<Convocatoria>[] = [
  { key: 'nombre', title: 'Convocatoria', sortable: true, width: '25%' }, { key: 'anio', title: 'Año académico', sortable: true, sortType: 'number' },
  { key: 'grado', title: 'Nivel / grado', sortable: true }, { key: 'apertura', title: 'Fecha de apertura', sortable: true, sortType: 'date' },
  { key: 'cierre', title: 'Fecha de cierre', sortable: true, sortType: 'date' }, { key: 'cupos', title: 'Cupos', align: 'center' },
  { key: 'postulantes', title: 'Inscritos', sortable: true, sortType: 'number', align: 'center' }, { key: 'estado', title: 'Estado', sortable: true, align: 'center' },
  { key: 'id', title: 'Acciones', align: 'center', width: '76px' }
];
const dateLabel = (value: string) => new Intl.DateTimeFormat('es-PE').format(new Date(value));
const filtered = computed(() => convocatorias.value.filter(x => (!submitted.value.anio || x.anio === submitted.value.anio) && (!submitted.value.grado || x.grado === submitted.value.grado) && (!submitted.value.estado || x.estado === submitted.value.estado) && (!submitted.value.nombre || `${x.nombre} ${x.descripcion || ''}`.toLocaleLowerCase().includes(submitted.value.nombre.toLocaleLowerCase()))));
function buscar(filters: FilterValues) {
  submitted.value = {
    anio: typeof filters.anio === 'string' ? filters.anio : null,
    grado: typeof filters.grado === 'string' ? filters.grado : null,
    estado: typeof filters.estado === 'string' && estados.includes(filters.estado as ConvocatoriaEstado) ? filters.estado as ConvocatoriaEstado : null,
    nombre: typeof filters.nombre === 'string' ? filters.nombre.trim() : ''
  };
}
</script>
<template>
  <HeinrichHeroBanner title="Admisión" subtitle="Administración de convocatorias" />
  <div class="d-flex justify-end mb-6 mt-n3">
    <v-btn color="primary" :prepend-icon="PlusIcon" @click="router.push({ name: 'admision-convocatoria-nueva' })">Nueva convocatoria</v-btn>
  </div>
  <HeinrichFilterCard :model="filterModel" class="mb-6" @search="buscar" @reset="buscar" />
  <UiParentCard title="Convocatorias registradas" icon="mdi-calendar-text-outline">
    <HeinrichDataTable :columns="columns" :rows="filtered" row-key="id">
      <template #item-nombre="{ item }">
        <div class="font-weight-medium">{{ item.nombre }}</div>
        <div v-if="item.descripcion" class="text-body-small text-medium-emphasis">{{ item.descripcion }}</div>
      </template>
      <template #item-apertura="{ item }">{{ dateLabel(item.apertura) }}</template>
      <template #item-cierre="{ item }">{{ dateLabel(item.cierre) }}</template>
      <template #item-cupos="{ item }">
        {{ item.registros }} / {{ item.cupos }}
      </template>
      <template #item-estado="{ item }"><HeinrichStatusChip :status="item.estado" /></template>
      <template #item-id="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-tooltip text="Ver detalle">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps"><v-btn v-bind="props" icon variant="text" size="small" aria-label="Acciones de la convocatoria"><DotsVerticalIcon size="20" /></v-btn></span>
              </template>
            </v-tooltip>
          </template>
          <v-list density="compact">
            <v-list-item title="Configurar" @click="router.push({ name: 'admision-convocatoria-configurar', params: { id: item.id } })" />
            <v-list-item title="Ver postulaciones" subtitle="Próximamente" disabled />
          </v-list>
        </v-menu>
      </template>
    </HeinrichDataTable>
  </UiParentCard>
</template>
