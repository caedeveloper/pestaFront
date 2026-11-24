import type {
    ColumnOptions,
    DataTableProps,
    DataTablePagination
} from './data-table.types';

// #region Column defaults

export const DEFAULT_COLUMN_OPTIONS: Required<
    Pick<
        ColumnOptions,
        | 'sortable'
        | 'sortType'
        | 'align'
        | 'format'
        | 'bold'
        | 'visible'
        | 'tooltip'
        | 'emptyText'
        | 'decimals'
    >
> = {
    sortable: false,
    sortType: 'auto',
    align: 'start',
    format: 'text',
    bold: false,
    visible: true,
    tooltip: false,
    emptyText: '—',
    decimals: 2
};

// #endregion

// #region Pagination defaults

export const DEFAULT_TABLE_PAGINATION: DataTablePagination = {
    page: 1,
    itemsPerPage: 10
};

// #endregion

// #region Table defaults

export const DEFAULT_TABLE_OPTIONS = {
    loading: false,
    disabled: false,

    emptyText: 'No se encontraron registros.',

    paginationMode: 'local',

    itemsPerPage: DEFAULT_TABLE_PAGINATION.itemsPerPage,
    itemsPerPageOptions: [5, 10, 25, 50, 100],

    selectionMode: 'none',

    showFooter: true,
    striped: false,
    hover: true,

    density: 'compact'
} satisfies Partial<DataTableProps<object>>;

// #endregion

// #region Fetch defaults

export const DEFAULT_FETCH_OPTIONS = {
    lazy: false,
    errorMessage: 'No se pudieron obtener los registros.'
};

// #endregion

// #region Formatting

export const DATA_TABLE_LOCALE = 'es-PE';

export const BOOLEAN_LABELS = {
    TRUE: 'Sí',
    FALSE: 'No'
} as const;

// #endregion