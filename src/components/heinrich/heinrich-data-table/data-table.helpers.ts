import type {
    ColumnOptions,
    ColumnSortType,
    HeinrichColumn
} from './data-table.types';

import {
    DEFAULT_COLUMN_OPTIONS,
    DATA_TABLE_LOCALE,
    BOOLEAN_LABELS
} from './data-table.constants';

// #region Columns

export function resolverColumns<T extends object>(
    columns: HeinrichColumn<T>[],
    defaults?: ColumnOptions
): HeinrichColumn<T>[] {

    return columns.map(column => {
        const resolved = {
            ...DEFAULT_COLUMN_OPTIONS,
            ...defaults,
            ...column
        };

        return {
            ...resolved,
            headerAlign: resolved.headerAlign ?? resolved.align
        };
    });
}

// #endregion

// #region Values

export function esValorVacio(value: unknown): boolean {
    return value === null ||
        value === undefined ||
        value === '';
}

export function obtenerColumnValue<T extends object>(
    item: T,
    key: keyof T
): unknown {
    return item[key];
}

// #endregion

// #region Date

export function convertirDate(value: unknown): Date | undefined {

    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? undefined
            : value;
    }

    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();

    const match = normalized.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);

        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return undefined;
        }

        return date;
    }

    // ISO: yyyy-MM-dd
    const isoDate = normalized.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (isoDate) {
        return convertirDate(
            `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`
        );
    }

    // ISO datetime
    if (!/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
        return undefined;
    }

    const date = new Date(normalized);

    return Number.isNaN(date.getTime())
        ? undefined
        : date;
}

function formatearDate(
    value: unknown,
    options: Intl.DateTimeFormatOptions,
    emptyText: string
): string {

    const date = convertirDate(value);

    if (!date) {
        return emptyText;
    }

    return new Intl.DateTimeFormat(
        DATA_TABLE_LOCALE,
        options
    ).format(date);
}

// #endregion

// #region Formatting

function convertirNumber(value: unknown): number | undefined {

    if (
        typeof value !== 'number' &&
        typeof value !== 'string'
    ) {
        return undefined;
    }

    if (typeof value === 'string' && !value.trim()) {
        return undefined;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : undefined;
}

export function formatearValue(
    value: unknown,
    options: ColumnOptions = {}
): string {

    const emptyText =
        options.emptyText ?? DEFAULT_COLUMN_OPTIONS.emptyText;

    const decimals = Math.min(
        20,
        Math.max(
            0,
            Math.trunc(
                options.decimals ?? DEFAULT_COLUMN_OPTIONS.decimals
            )
        )
    );

    if (esValorVacio(value)) {
        return emptyText;
    }

    if (Array.isArray(value)) {
        return value.length
            ? value.map(item => formatearValue(item, options)).join(', ')
            : emptyText;
    }

    switch (options.format) {

        case 'date':
            return formatearDate(value, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }, emptyText);

        case 'datetime':
            return formatearDate(value, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }, emptyText);

        case 'time': {
            if (
                typeof value === 'string' &&
                /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)
            ) {
                return value.slice(0, 5);
            }

            return formatearDate(value, {
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }, emptyText);
        }

        case 'boolean':
            if (typeof value !== 'boolean') {
                return emptyText;
            }

            return value
                ? BOOLEAN_LABELS.TRUE
                : BOOLEAN_LABELS.FALSE;

        case 'number':
        case 'percentage': {
            const number = convertirNumber(value);

            if (number === undefined) {
                return emptyText;
            }

            return new Intl.NumberFormat(
                DATA_TABLE_LOCALE,
                {
                    style: options.format === 'percentage'
                        ? 'percent'
                        : 'decimal',

                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }
            ).format(number);
        }

        case 'text':
        default:
            return String(value);
    }
}

export function obtenerColumnContent<T extends object>(
    item: T,
    column: HeinrichColumn<T>
): string {

    if (column.formatter) {
        return column.formatter(item);
    }

    return formatearValue(
        obtenerColumnValue(item, column.key),
        column
    );
}

export function obtenerColumnSubContent<T extends object>(
    item: T,
    column: HeinrichColumn<T>
): string {

    if (!column.sub) {
        return '';
    }

    if (column.sub.formatter) {
        return column.sub.formatter(item);
    }

    const value = obtenerColumnValue(
        item,
        column.sub.key
    );

    if (esValorVacio(value)) {
        return column.sub.emptyText ?? '';
    }

    return formatearValue(value, {
        format: column.sub.format,
        emptyText: column.sub.emptyText ?? '',
        decimals: column.decimals
    });
}

// #endregion

// #region Sorting

export function detectarSortType(
    value: unknown
): ColumnSortType {

    if (typeof value === 'number') {
        return 'number';
    }

    if (value instanceof Date) {
        return 'date';
    }

    if (typeof value === 'string') {

        if (convertirDate(value)) {
            return 'date';
        }

        if (convertirNumber(value) !== undefined) {
            return 'number';
        }
    }

    return 'text';
}

export function compararValues(
    first: unknown,
    second: unknown,
    sortType: ColumnSortType = 'auto'
): number {

    const firstEmpty = esValorVacio(first);
    const secondEmpty = esValorVacio(second);

    if (firstEmpty && secondEmpty) return 0;
    if (firstEmpty) return 1;
    if (secondEmpty) return -1;

    let resolvedType = sortType;

    if (resolvedType === 'auto') {
        const firstType = detectarSortType(first);
        const secondType = detectarSortType(second);

        resolvedType = firstType === secondType
            ? firstType
            : 'text';
    }

    switch (resolvedType) {

        case 'number': {
            const a = convertirNumber(first);
            const b = convertirNumber(second);

            if (a === undefined && b === undefined) return 0;
            if (a === undefined) return 1;
            if (b === undefined) return -1;

            return a - b;
        }

        case 'date': {
            const a = convertirDate(first)?.getTime();
            const b = convertirDate(second)?.getTime();

            if (a === undefined && b === undefined) return 0;
            if (a === undefined) return 1;
            if (b === undefined) return -1;

            return a - b;
        }

        case 'text':
        default:
            return String(first).localeCompare(
                String(second),
                DATA_TABLE_LOCALE,
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );
    }
}

// #endregion