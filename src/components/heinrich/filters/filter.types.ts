export type FilterPrimitive = string | number | boolean;

export type FilterValue =
    | FilterPrimitive
    | FilterPrimitive[]
    | undefined;

export type FilterValues = Record<string, FilterValue>;

export type FilterItems = readonly unknown[];

export interface BaseFilter {
    label: string;
    required?: boolean;
    disabled?: boolean;
    clearable?: boolean;

    cols?: number;
    sm?: number;
    md?: number;
    lg?: number;

    placeholder?: string;
    dependsOn?: readonly string[];
}

export interface TextFilter extends BaseFilter {
    type: 'text';
    defaultValue?: string;
}

export interface NumberFilter extends BaseFilter {
    type: 'number';
    defaultValue?: number;
}

export interface DateFilter extends BaseFilter {
    type: 'date';
    defaultValue?: string;
}

export interface CheckboxFilter extends BaseFilter {
    type: 'checkbox';
    defaultValue?: boolean;
}

interface BaseSelectionFilter extends BaseFilter {
    itemTitle?: string;
    itemValue?: string;
}

type SelectionSource =
    | {
          items: FilterItems;
          loadOptions?: never;
      }
    | {
          items?: never;
          loadOptions: (
              values: Readonly<FilterValues>
          ) => Promise<FilterItems>;
      };

type SelectionMode =
    | {
          multiple?: false;
          defaultValue?: FilterPrimitive;
      }
    | {
          multiple: true;
          defaultValue?: FilterPrimitive[];
      };

export type SelectFilter = BaseSelectionFilter &
    SelectionSource &
    SelectionMode & {
        type: 'select';
    };

export type AutocompleteFilter = BaseSelectionFilter &
    SelectionSource &
    SelectionMode & {
        type: 'autocomplete';
    };

export type SelectionFilter =
    | SelectFilter
    | AutocompleteFilter;

export type FilterField =
    | TextFilter
    | NumberFilter
    | DateFilter
    | CheckboxFilter
    | SelectFilter
    | AutocompleteFilter;

export type FilterType = FilterField['type'];

export type FilterModel = Record<string, FilterField>;

export function defineFilters<T extends FilterModel>(
    model: T
): T {
    return model;
}
