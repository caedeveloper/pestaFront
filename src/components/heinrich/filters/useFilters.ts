import {reactive,shallowReactive,onScopeDispose} from 'vue';

import type {FilterModel,FilterField,FilterValue,FilterValues,FilterItems} from './filter.types';

export function useFilters(
    getModel: () => FilterModel
) {
    const values = reactive<FilterValues>({});

    const options = shallowReactive<
        Record<string, FilterItems>
    >({});

    const loading = reactive<
        Record<string, boolean>
    >({});

    const errors = reactive<
        Record<string, string | undefined>
    >({});

    const requestVersions = new Map<string, number>();

    let disposed = false;

    function isEmpty(value: FilterValue): boolean {
        return (
            value === undefined ||
            value === null ||
            value === '' ||
            (
                Array.isArray(value) &&
                value.length === 0
            )
        );
    }

    function cloneValue(
        value: FilterValue
    ): FilterValue {
        return Array.isArray(value)
            ? [...value]
            : value;
    }

    function isSelection(field: FilterField) {
        return (
            field.type === 'select' ||
            field.type === 'autocomplete'
        );
    }

    function dependenciesMet(
        field: FilterField
    ): boolean {
        return (field.dependsOn ?? []).every(
            key => !isEmpty(values[key])
        );
    }

    function isDisabled(key: string): boolean {
        const field = getModel()[key];

        return (
            !!field.disabled ||
            !dependenciesMet(field)
        );
    }

    function getOptions(key: string): FilterItems {
        const field = getModel()[key];

        if (
            field.type !== 'select' &&
            field.type !== 'autocomplete'
        ) {
            return [];
        }

        if (!dependenciesMet(field)) {
            return [];
        }

        return field.loadOptions
            ? options[key] ?? []
            : field.items ?? [];
    }

    function invalidateRequest(key: string) {
        requestVersions.set(
            key,
            (requestVersions.get(key) ?? 0) + 1
        );

        delete options[key];
        delete errors[key];

        loading[key] = false;
    }

    function getFilters(): FilterValues {
        const result: FilterValues = {};

        for (const [key, field] of Object.entries(
            getModel()
        )) {
            const value = values[key];

            if (
                !isEmpty(value) &&
                dependenciesMet(field)
            ) {
                result[key] = cloneValue(value);
            }
        }

        return result;
    }

    async function loadOptions(key: string) {
        if (disposed) return;

        const field = getModel()[key];

        if (
            field.type !== 'select' &&
            field.type !== 'autocomplete'
        ) {
            return;
        }

        if (!field.loadOptions) return;

        invalidateRequest(key);

        if (!dependenciesMet(field)) return;

        const version = requestVersions.get(key);

        loading[key] = true;

        try {
            const result = await field.loadOptions(
                getFilters()
            );

            if (
                !disposed &&
                requestVersions.get(key) === version
            ) {
                options[key] = result;
            }
        } catch {
            if (
                !disposed &&
                requestVersions.get(key) === version
            ) {
                errors[key] =
                    'No se pudieron cargar las opciones.';
            }
        } finally {
            if (
                !disposed &&
                requestVersions.get(key) === version
            ) {
                loading[key] = false;
            }
        }
    }

    function getDependents(key: string): string[] {
        const model = getModel();

        const result: string[] = [];
        const visited = new Set<string>([key]);

        function visit(parentKey: string) {
            for (const [fieldKey, field] of Object.entries(
                model
            )) {
                if (
                    field.dependsOn?.includes(parentKey) &&
                    !visited.has(fieldKey)
                ) {
                    visited.add(fieldKey);
                    result.push(fieldKey);

                    visit(fieldKey);
                }
            }
        }

        visit(key);

        return result;
    }

    function normalizeValue(
        field: FilterField,
        value: unknown
    ): FilterValue {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return undefined;
        }

        if (field.type === 'number') {
            const number = Number(value);

            return Number.isFinite(number)
                ? number
                : undefined;
        }

        if (
            field.type === 'text' ||
            field.type === 'date'
        ) {
            return typeof value === 'string'
                ? value
                : undefined;
        }

        if (field.type === 'checkbox') {
            return typeof value === 'boolean'
                ? value
                : undefined;
        }

        const isPrimitive = (
            item: unknown
        ): item is string | number | boolean =>
            typeof item === 'string' ||
            typeof item === 'boolean' ||
            (
                typeof item === 'number' &&
                Number.isFinite(item)
            );

        if (
            (
                field.type === 'select' ||
                field.type === 'autocomplete'
            ) &&
            field.multiple
        ) {
            return Array.isArray(value) &&
                value.every(isPrimitive)
                ? [...value]
                : undefined;
        }

        return isPrimitive(value)
            ? value
            : undefined;
    }

    async function setValue(
        key: string,
        rawValue: unknown
    ) {
        const field = getModel()[key];

        if (!field || isDisabled(key)) return;

        const value = normalizeValue(
            field,
            rawValue
        );

        if (Object.is(values[key], value)) return;

        values[key] = value;

        const dependents = getDependents(key);

        for (const dependentKey of dependents) {
            delete values[dependentKey];

            invalidateRequest(dependentKey);
        }

        await Promise.all(
            dependents.map(
                dependentKey => loadOptions(dependentKey)
            )
        );
    }

    function validateModel() {
        const model = getModel();

        const completed = new Set<string>();
        const visiting = new Set<string>();

        function visit(key: string) {
            if (completed.has(key)) return;

            if (visiting.has(key)) {
                throw new Error(
                    `Dependencia circular en el filtro "${key}".`
                );
            }

            if (!Object.hasOwn(model, key)) {
                throw new Error(
                    `El campo "${key}" no existe en el modelo.`
                );
            }

            visiting.add(key);

            for (const dependency of
                model[key].dependsOn ?? []) {
                visit(dependency);
            }

            visiting.delete(key);
            completed.add(key);
        }

        Object.keys(model).forEach(visit);

        return [...completed];
    }

    async function initialize() {
        const orderedKeys = validateModel();

        for (const key of Object.keys(values)) {
            delete values[key];
        }

        const model = getModel();

        for (const key of orderedKeys) {
            const field = model[key];

            invalidateRequest(key);

            if (dependenciesMet(field)) {
                values[key] = cloneValue(
                    field.defaultValue
                );
            }
        }

        await Promise.all(
            orderedKeys
                .filter(key => isSelection(model[key]))
                .map(key => loadOptions(key))
        );
    }

    async function reset() {
        await initialize();
    }

    onScopeDispose(() => {
        disposed = true;

        requestVersions.clear();
    });

    return {
        values,
        options,
        loading,
        errors,

        isEmpty,
        isDisabled,
        getOptions,
        getFilters,

        setValue,
        loadOptions,
        initialize,
        reset
    };
}