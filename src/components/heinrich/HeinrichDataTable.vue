<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue';
export type HeinrichColumn<T> = { key: keyof T & string; title: string; sortable?: boolean; sortType?: 'text' | 'number' | 'date'; align?: 'start' | 'center' | 'end'; width?: string };
const props = withDefaults(defineProps<{ columns: HeinrichColumn<T>[]; rows: T[]; rowKey: keyof T & string; itemsPerPage?: number; emptyMessage?: string }>(), { itemsPerPage: 5, emptyMessage: 'No hay registros para mostrar.' });
const page = ref(1), sortKey = ref<string | null>(null), sortDescending = ref(false);
const pageCount = computed(() => Math.max(1, Math.ceil(props.rows.length / props.itemsPerPage)));
function dateValue(value: unknown) { if (typeof value !== 'string') return 0; const [day, month, year] = value.split('/'); return Date.parse(`${year}-${month}-${day}`) || 0; }
const orderedRows = computed(() => { const rows = [...props.rows], column = props.columns.find(item => item.key === sortKey.value); if (!column) return rows; return rows.sort((a, b) => { const first = a[column.key], second = b[column.key]; let result: number; if (column.sortType === 'number') result = Number(first) - Number(second); else if (column.sortType === 'date') result = dateValue(first) - dateValue(second); else result = String(first ?? '').localeCompare(String(second ?? ''), 'es', { sensitivity: 'base', numeric: true }); return sortDescending.value ? -result : result; }); });
const visibleRows = computed(() => orderedRows.value.slice((page.value - 1) * props.itemsPerPage, page.value * props.itemsPerPage));
const start = computed(() => props.rows.length ? (page.value - 1) * props.itemsPerPage + 1 : 0), end = computed(() => Math.min(page.value * props.itemsPerPage, props.rows.length));
watch(() => props.rows.length, () => { if (page.value > pageCount.value) page.value = pageCount.value; });
function toggleSort(column: HeinrichColumn<T>) { if (!column.sortable) return; if (sortKey.value === column.key) sortDescending.value = !sortDescending.value; else { sortKey.value = column.key; sortDescending.value = false; } page.value = 1; }
</script>
<template>
  <div class="heinrich-table-scroll">
    <v-table class="heinrich-data-table" hover
      ><thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            :class="`text-${column.align || 'start'}`"
            :aria-sort="sortKey === column.key ? (sortDescending ? 'descending' : 'ascending') : 'none'"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="heinrich-sort"
              @click="toggleSort(column)"
            >
              <span>{{ column.title }}</span
              ><v-icon
                size="16"
                aria-hidden="true"
                >{{ sortKey === column.key ? (sortDescending ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-unfold-more-horizontal' }}</v-icon
              ></button
            ><template v-else>{{ column.title }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in visibleRows" :key="String(row[rowKey])">
          <td
            v-for="column in columns"
            :key="column.key"
            :class="`text-${column.align || 'start'}`"
          >
            <slot
              :name="`item-${column.key}`"
              :item="row"
              >{{ row[column.key] }}</slot
            >
          </td>
        </tr>
        <tr v-if="!visibleRows.length">
          <td
            :colspan="columns.length"
            class="text-center py-8 text-medium-emphasis"
          >
            <slot name="empty">{{ emptyMessage }}</slot>
          </td>
        </tr>
      </tbody></v-table
    >
  </div>
  <div
    class="heinrich-table-footer d-flex flex-wrap align-center justify-space-between ga-3 px-5 py-4"
  >
    <span class="text-body-small text-medium-emphasis"
      >{{ start }}–{{ end }} de {{ rows.length }} registros</span
    ><v-pagination
      v-model="page"
      :length="pageCount"
      :total-visible="5"
      density="compact"
      aria-label="Paginación"
    />
  </div>
</template>
<style scoped>
.heinrich-table-scroll {
  overflow-x: auto;
  border: 1px solid rgb(var(--v-theme-borderColor));
  border-radius: 0.5rem 0.5rem 0 0;
}
.heinrich-data-table :deep(th) {
  white-space: nowrap;
  background: rgb(var(--v-theme-grey100));
  color: #000;
  font-size: 0.8125rem;
  font-weight: 700;
}
.heinrich-data-table :deep(td) {
  font-size: 0.875rem;
  vertical-align: middle;
}
.heinrich-table-footer { border: 1px solid rgb(var(--v-theme-borderColor)); border-top: 0; border-radius: 0 0 0.5rem 0.5rem; }
.heinrich-sort {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
}
.heinrich-sort:hover {
  color: rgb(var(--v-theme-primary));
}
.heinrich-sort:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
