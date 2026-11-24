export type ColumnAlign = 'start' | 'center' | 'end';

export type ColumnSortType =
    'auto' | 'text' | 'number' | 'date';

export type ColumnFormat =
    'text' |
    'date' |
    'datetime' |
    'time' |
    'boolean' |
    'number' |
    'percentage';

export type SortDirection = 'asc' | 'desc';

export type PaginationMode =
    'local' | 'server' | 'none';

export type SelectionMode =
    'none' | 'single' | 'multiple';

export interface ColumnOptions {
    sortable?: boolean;
    sortType?: ColumnSortType;

    align?: ColumnAlign;
    headerAlign?: ColumnAlign;

    width?: string;
    minWidth?: string;
    maxWidth?: string;

    format?: ColumnFormat;

    bold?: boolean;
    visible?: boolean;
    truncate?: number;
    tooltip?: boolean;

    emptyText?: string;
    decimals?: number;
}

export interface ColumnSubContent<T extends object> {
    key: keyof T & string;
    format?: ColumnFormat;
    emptyText?: string;
    formatter?: (item: T) => string;
}

export interface HeinrichColumn<T extends object>
    extends ColumnOptions {

    key: keyof T & string;
    title: string;

    sub?: ColumnSubContent<T>;
    formatter?: (item: T) => string;
}

// #region Pagination

export interface DataTableSort<T extends object> {
    key: keyof T & string;
    direction: SortDirection;
}

export interface DataTablePagination {
    page: number;
    itemsPerPage: number;
}

export interface DataTableQuery<T extends object>
    extends DataTablePagination {

    sort?: DataTableSort<T>;
}

export interface PagedResponse<T> {
    items: T[];
    totalItems: number;
}

// #endregion

// #region State

export interface DataTableState<T extends object> {
    rows: T[];
    totalItems: number;
    loading: boolean;
}

export interface DataTableFetchOptions<TFilter extends object> {
    initialFilters: TFilter;
    itemsPerPage?: number;
    lazy?: boolean;
    errorMessage?: string;
}

export type DataTableFetchFunction<
    T extends object,
    TFilter extends object
> = (
    filters: TFilter,
    query: DataTableQuery<T>
) => Promise<PagedResponse<T>>;

// #endregion

// #region Component

export interface DataTableProps<T extends object> {
    columns: HeinrichColumn<T>[];
    rowKey: keyof T & string;

    rows?: T[];
    state?: DataTableState<T>;

    defaults?: ColumnOptions;

    loading?: boolean;
    disabled?: boolean;
    emptyText?: string;

    paginationMode?: PaginationMode;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];

    totalItems?: number;

    selectionMode?: SelectionMode;

    showFooter?: boolean;
    striped?: boolean;
    hover?: boolean;

    density?: 'default' | 'comfortable' | 'compact';
}

// #endregion