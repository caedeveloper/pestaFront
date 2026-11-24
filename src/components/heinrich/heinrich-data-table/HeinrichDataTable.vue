<script setup lang="ts" generic="T extends object">
import { computed,ref,shallowRef,useSlots,watch } from 'vue';
import { VDataTable, VDataTableServer } from 'vuetify/components';

import type {
    DataTableProps,
    DataTableQuery,
    HeinrichColumn
} from './data-table.types';

import {
    DEFAULT_TABLE_OPTIONS,
    DEFAULT_TABLE_PAGINATION
} from './data-table.constants';

import {
    resolverColumns,
    compararValues,
    obtenerColumnContent,
    obtenerColumnSubContent
} from './data-table.helpers';

const props = withDefaults(
    defineProps<DataTableProps<T>>(),
    {
        loading: DEFAULT_TABLE_OPTIONS.loading,
        disabled: DEFAULT_TABLE_OPTIONS.disabled,
        emptyText: DEFAULT_TABLE_OPTIONS.emptyText,

        paginationMode: DEFAULT_TABLE_OPTIONS.paginationMode,
        itemsPerPage: DEFAULT_TABLE_OPTIONS.itemsPerPage,

        itemsPerPageOptions: () => [
            ...DEFAULT_TABLE_OPTIONS.itemsPerPageOptions
        ],

        selectionMode: DEFAULT_TABLE_OPTIONS.selectionMode,
        showFooter: DEFAULT_TABLE_OPTIONS.showFooter,
        striped: DEFAULT_TABLE_OPTIONS.striped,
        hover: DEFAULT_TABLE_OPTIONS.hover,
        density: DEFAULT_TABLE_OPTIONS.density
    }
);

const emit = defineEmits<{
    'query-change': [query: DataTableQuery<T>];
}>();

const query = defineModel<DataTableQuery<T>>('query');

const selectedKeys = defineModel<(string | number)[]>(
    'selectedKeys',
    {
        default: () => []
    }
);

const slots = useSlots();

const page = ref(DEFAULT_TABLE_PAGINATION.page);

const internalQuery = shallowRef<DataTableQuery<T>>({
    page: DEFAULT_TABLE_PAGINATION.page,
    itemsPerPage: props.itemsPerPage
});

// #region State

const rows = computed(() =>
    props.state?.rows ??
    props.rows ??
    []
);

const loading = computed(() =>
    props.state?.loading ??
    props.loading
);

const totalItems = computed(() =>
    props.state?.totalItems ??
    props.totalItems ??
    0
);

const isServer = computed(() =>
    props.state !== undefined ||
    props.paginationMode === 'server'
);

const activeQuery = computed(() =>
    query.value ?? internalQuery.value
);

// #endregion

// #region Columns

const columns = computed(() =>
    resolverColumns(
        props.columns,
        props.defaults
    ).filter(column => column.visible !== false)
);

const headers = computed(() =>
    columns.value.map(column => ({
        key: column.key,
        title: column.title,

        sortable: column.sortable,
        align: column.align,

        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,

        headerProps: {
            class: `heinrich-header-${column.headerAlign}`
        },

        sort: column.sortable
            ? (a: unknown, b: unknown) =>
                compararValues(a, b, column.sortType)
            : undefined
    }))
);

const customHeaderColumns = computed(() =>
    columns.value.filter(
        column => slots[`header-${column.key}`]
    )
);

// #endregion

// #region Vuetify adapter

const tableComponent = computed(() =>
    isServer.value
        ? VDataTableServer
        : VDataTable
);

const tableBindings = computed(() => ({

    headers: headers.value,
    items: rows.value,

    itemValue: props.rowKey,

    loading: loading.value,
    loadingText: 'Cargando registros...',
    noDataText: props.emptyText,

    density: props.density,
    hover: props.hover,

    page: isServer.value
        ? activeQuery.value.page
        : page.value,

    itemsPerPage: isServer.value
        ? activeQuery.value.itemsPerPage
        : props.paginationMode === 'none'
            ? -1
            : props.itemsPerPage,

    itemsPerPageOptions: props.itemsPerPageOptions,

    hideDefaultFooter:
        !props.showFooter ||
        (
            !isServer.value &&
            props.paginationMode === 'none'
        ),

    showSelect: props.selectionMode !== 'none',

    selectStrategy:
        props.selectionMode === 'single'
            ? 'single' as const
            : 'page' as const,

    multiSort: false,
    returnObject: false,

    ...(isServer.value
        ? {
            itemsLength: totalItems.value,

            sortBy: activeQuery.value.sort
                ? [{
                    key: activeQuery.value.sort.key,
                    order: activeQuery.value.sort.direction
                }]
                : []
        }
        : {})
}));

// #endregion

// #region Slot adapter

function obtenerItem(slotProps: {
    item: unknown;
    internalItem?: {
        raw: unknown;
    };
}): T {

    return (
        slotProps.internalItem?.raw ??
        slotProps.item
    ) as T;
}

// #endregion

// #region Query adapter

interface VuetifyTableOptions {
    page: number;
    itemsPerPage: number;
    sortBy: {
        key: string;
        order?: boolean | 'asc' | 'desc';
    }[];
}

function esMismaQuery(
    first: DataTableQuery<T>,
    second: DataTableQuery<T>
): boolean {

    return (
        first.page === second.page &&
        first.itemsPerPage === second.itemsPerPage &&
        first.sort?.key === second.sort?.key &&
        first.sort?.direction === second.sort?.direction
    );
}

let initialRemoteQueryEmitted = false;

function asignarQuery(
    newQuery: DataTableQuery<T>
): void {

    const hasModel = query.value !== undefined;

    if (esMismaQuery(activeQuery.value, newQuery)) {

        if (!hasModel && !initialRemoteQueryEmitted) {
            initialRemoteQueryEmitted = true;
            emit('query-change', newQuery);
        }

        return;
    }

    if (hasModel) {
        query.value = newQuery;
    } else {
        internalQuery.value = newQuery;
    }

    initialRemoteQueryEmitted = true;

    emit('query-change', newQuery);
}

function actualizarQuery(
    options: VuetifyTableOptions
): void {

    if (!isServer.value) {

        page.value = options.page;

        return;
    }

    if (options.itemsPerPage <= 0) {
        return;
    }

    const currentSort = options.sortBy[0];

    const sortColumn = columns.value.find(
        column =>
            column.key === currentSort?.key &&
            column.sortable
    );

    const newQuery: DataTableQuery<T> = {
        page: options.page,
        itemsPerPage: options.itemsPerPage
    };

    if (
        currentSort &&
        sortColumn &&
        currentSort.order !== false
    ) {

        newQuery.sort = {
            key: sortColumn.key,

            direction: currentSort.order === 'desc'
                ? 'desc'
                : 'asc'
        };
    }

    asignarQuery(newQuery);
}

// #endregion

// #region Presentation

function obtenerContentStyle(
    column: HeinrichColumn<T>
) {

    if (column.wrap) {
        return {
            maxWidth: column.maxWidth ?? column.width,
            whiteSpace: 'normal' as const,
            overflowWrap: 'anywhere' as const
        };
    }

    if (!column.truncate) {
        return undefined;
    }

    return {
        maxWidth: `${column.truncate}px`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
    };
}

function reiniciarPagination(): void {

    if (isServer.value) {

        asignarQuery({
            ...activeQuery.value,
            page: DEFAULT_TABLE_PAGINATION.page
        });

    } else {

        page.value = DEFAULT_TABLE_PAGINATION.page;
    }
}

watch(
    () => props.rows,
    () => {
        if (!isServer.value) {
            reiniciarPagination();
        }
    }
);

watch(isServer, () => {
    initialRemoteQueryEmitted = false;
    page.value = DEFAULT_TABLE_PAGINATION.page;
});

watch(
    () => props.selectionMode,
    () => {
        selectedKeys.value = [];
    }
);

defineExpose({
    reiniciarPagination
});

// #endregion
</script>

<template>
    <div class="heinrich-data-table" :class="{
        'heinrich-data-table--striped': striped
    }" :inert="disabled || undefined">
        <component :is="tableComponent" v-bind="tableBindings" v-model="selectedKeys" @update:options="actualizarQuery">
            <!-- Custom headers -->

            <template v-for="column in customHeaderColumns" v-slot:[`header.${column.key}`]>
                <slot :name="`header-${column.key}`" :column="column" />
            </template>

            <!-- Column content -->

            <template v-for="column in columns" v-slot:[`item.${column.key}`]="slotProps">
                <slot :name="`item-${column.key}`" :item="obtenerItem(slotProps)" :column="column">
                    <div :class="{
                        'font-weight-medium': column.bold
                    }" :style="obtenerContentStyle(column)" :title="column.tooltip || column.truncate
                                ? obtenerColumnContent(
                                    obtenerItem(slotProps),
                                    column
                                )
                                : undefined
                            ">
                        {{
                            obtenerColumnContent(
                                obtenerItem(slotProps),
                                column
                            )
                        }}
                    </div>

                    <div v-if="
                        column.sub &&
                        obtenerColumnSubContent(
                            obtenerItem(slotProps),
                            column
                        )
                    " class="text-body-small text-medium-emphasis" :style="obtenerContentStyle(column)">
                        {{
                            obtenerColumnSubContent(
                                obtenerItem(slotProps),
                                column
                            )
                        }}
                    </div>
                </slot>
            </template>
        </component>
    </div>
</template>

<style scoped>
.heinrich-data-table {
    border: 1px solid rgb(var(--v-theme-borderColor));
    border-radius: 0.5rem;
    overflow: hidden;
}

/* Header */

.heinrich-data-table :deep(thead > tr > th) {
    background-color: rgb(var(--v-theme-grey100));
    color: rgb(var(--v-theme-on-surface));

    font-size: 0.8125rem;
    font-weight: 700;

    white-space: nowrap;
    height: 50px;

    border-bottom: 1px solid rgb(var(--v-theme-borderColor));
}

.heinrich-data-table :deep(.v-data-table-header__content) {
    font-weight: 700;
}

/* Header alignment */

.heinrich-data-table :deep(.heinrich-header-start .v-data-table-header__content) {
    justify-content: flex-start;
}

.heinrich-data-table :deep(.heinrich-header-center .v-data-table-header__content) {
    justify-content: center;
}

.heinrich-data-table :deep(.heinrich-header-end .v-data-table-header__content) {
    justify-content: flex-end;
}

/* Rows */

.heinrich-data-table :deep(tbody > tr > td) {
    font-size: 0.875rem;
    vertical-align: middle;
}

.heinrich-data-table :deep(tbody > tr:not(:last-child) > td) {
    border-bottom: 1px solid rgb(var(--v-theme-borderColor));
}

/* Striped rows */

.heinrich-data-table--striped :deep(tbody > tr:nth-child(even)) {
    background-color: rgba(var(--v-theme-on-surface),
            var(--v-hover-opacity));
}

/* Footer */

.heinrich-data-table :deep(.v-data-table-footer) {
    border-top: 1px solid rgb(var(--v-theme-borderColor));
    padding: 0.75rem 1rem;
}
</style>
