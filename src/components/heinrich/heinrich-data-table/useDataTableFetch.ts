import {
    computed,
    shallowRef,
    ref,
    watch,
    onScopeDispose
} from 'vue';

import type {
    DataTableQuery,
    DataTableState,
    DataTableFetchOptions,
    DataTableFetchFunction
} from './data-table.types';

import {
    DEFAULT_TABLE_PAGINATION,
    DEFAULT_FETCH_OPTIONS
} from './data-table.constants';

export default function useDataTableFetch<
    T extends object,
    TFilter extends object
>(
    fetchFunction: DataTableFetchFunction<T, TFilter>,
    options: DataTableFetchOptions<TFilter>
) {

    // #region State

    const rows = shallowRef<T[]>([]);
    const totalItems = ref(0);

    const loading = ref(false);
    const errorMessage = ref('');

    const filters = shallowRef<TFilter>({
        ...options.initialFilters
    });

    const query = shallowRef<DataTableQuery<T>>({
        page: DEFAULT_TABLE_PAGINATION.page,
        itemsPerPage:
            options.itemsPerPage ??
            DEFAULT_TABLE_PAGINATION.itemsPerPage
    });

    const refreshVersion = ref(0);

    let requestId = 0;

    let started = !(
        options.lazy ?? DEFAULT_FETCH_OPTIONS.lazy
    );

    // #endregion

    // #region Table state

    const state = computed<DataTableState<T>>(() => ({
        rows: rows.value,
        totalItems: totalItems.value,
        loading: loading.value
    }));

    // #endregion

    // #region Fetch

    async function fetch(): Promise<void> {

        const currentRequestId = ++requestId;

        const currentFilters = {
            ...filters.value
        };

        const currentQuery: DataTableQuery<T> = {
            ...query.value,
            sort: query.value.sort
                ? { ...query.value.sort }
                : undefined
        };

        loading.value = true;
        errorMessage.value = '';

        try {

            const response = await fetchFunction(
                currentFilters,
                currentQuery
            );

            if (currentRequestId !== requestId) {
                return;
            }

            totalItems.value = response.totalItems;

            const lastPage = Math.max(
                1,
                Math.ceil(
                    response.totalItems /
                    currentQuery.itemsPerPage
                )
            );

            if (currentQuery.page > lastPage) {

                query.value = {
                    ...currentQuery,
                    page: lastPage
                };

                return;
            }

            rows.value = response.items;

        } catch {

            if (currentRequestId !== requestId) {
                return;
            }

            rows.value = [];

            errorMessage.value =
                options.errorMessage ??
                DEFAULT_FETCH_OPTIONS.errorMessage;

        } finally {

            if (currentRequestId === requestId) {
                loading.value = false;
            }
        }
    }

    // #endregion

    // #region Operations

    function buscar(newFilters: TFilter): void {

        filters.value = {
            ...newFilters
        };

        query.value = {
            ...query.value,
            page: DEFAULT_TABLE_PAGINATION.page
        };

        started = true;

        refreshVersion.value++;
    }

    function recargar(): void {

        started = true;

        refreshVersion.value++;
    }

    function limpiarError(): void {
        errorMessage.value = '';
    }

    // #endregion

    // #region Watchers

    watch(
        [query, refreshVersion],
        () => {

            if (!started) {
                return;
            }

            void fetch();
        },
        {
            immediate: started
        }
    );

    onScopeDispose(() => {
        requestId++;
    });

    // #endregion

    return {
        state,
        query,
        errorMessage,

        buscar,
        recargar,
        limpiarError
    };
}