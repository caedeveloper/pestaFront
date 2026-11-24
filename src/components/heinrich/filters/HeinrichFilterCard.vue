<script setup lang="ts">
import {computed,ref,onMounted} from 'vue';
import {VTextField,VSelect,VAutocomplete,VCheckbox,VForm} from 'vuetify/components';
import {FilterPlusIcon,FilterMinusIcon} from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useFilters } from './useFilters';
import type {FilterModel,FilterField,FilterType,FilterValues,FilterValue} from './filter.types';

const props = withDefaults(
    defineProps<{
        model: FilterModel;
        title?: string;
        subtitle?: string;
        icon?: string;
        loading?: boolean;
        botonPrincipal?: string;
        botonSecundario?: string;
    }>(),
    {
        title: 'Filtros',
        subtitle: '',
        icon: 'mdi-filter-outline',
        loading: false,
        botonPrincipal: 'Buscar',
        botonSecundario: 'Limpiar'
    }
);

const emit = defineEmits<{
    search: [filters: FilterValues];
    reset: [filters: FilterValues];
}>();

const mostrarFiltros = ref(true);

const frmFiltros =
    ref<InstanceType<typeof VForm>>();

const {
    values,
    loading: fieldLoading,
    errors,
    isEmpty,
    isDisabled,
    getOptions,
    getFilters,
    setValue,
    initialize,
    reset
} = useFilters(() => props.model);

const loadingOptions = computed(() =>
    Object.values(fieldLoading).some(Boolean)
);

const componentes = {
    text: VTextField,
    number: VTextField,
    date: VTextField,
    select: VSelect,
    autocomplete: VAutocomplete,
    checkbox: VCheckbox
} as const;

function getComponent(type: FilterType) {
    return componentes[type];
}

function getRules(
    key: string,
    field: FilterField
) {
    if (
        !field.required ||
        isDisabled(key)
    ) {
        return [];
    }

    return [
        (value: FilterValue) => {
            const valid =
                !isEmpty(value) &&
                (
                    typeof value !== 'string' ||
                    value.trim().length > 0
                );

            return valid ||
                `${field.label} es requerido.`;
        }
    ];
}

function getFieldProps(
    key: string,
    field: FilterField
) {
    const common = {
        label: field.label,
        disabled: isDisabled(key) || props.loading,
        hideDetails: 'auto',
        rules: getRules(key, field)
    };

    switch (field.type) {
        case 'select':
        case 'autocomplete':
            return {
                ...common,
                items: getOptions(key),
                itemTitle: field.itemTitle ?? 'title',
                itemValue: field.itemValue ?? 'value',
                multiple: field.multiple ?? false,
                returnObject: false,
                clearable: field.clearable ?? true,
                loading: fieldLoading[key],
                errorMessages: errors[key],
                placeholder: field.placeholder
            };

        case 'checkbox':
            return {
                ...common,
                color: 'primary'
            };

        default:
            return {
                ...common,
                type: field.type,
                clearable: field.clearable ?? true,
                placeholder: field.placeholder
            };
    }
}

const renderedFields = computed(() =>
    Object.entries(props.model).map(
        ([key, field]) => ({
            key,
            field,
            component: getComponent(field.type),
            componentProps: getFieldProps(
                key,
                field
            )
        })
    )
);

const validating = ref(false);
const resetting = ref(false);

async function buscar() {
    if (
        props.loading ||
        loadingOptions.value ||
        validating.value ||
        resetting.value
    ) {
        return;
    }

    validating.value = true;

    try {
        const validation =
            await frmFiltros.value?.validate();

        if (!validation?.valid) {
            mostrarFiltros.value = true;
            return;
        }

        if (Object.values(errors).some(Boolean)) {
            mostrarFiltros.value = true;
            return;
        }

        emit('search', getFilters());
    } finally {
        validating.value = false;
    }
}

async function limpiar() {
    if (props.loading || resetting.value) return;

    resetting.value = true;

    try {
        await reset();

        frmFiltros.value?.resetValidation();

        emit('reset', getFilters());
    } finally {
        resetting.value = false;
    }
}

onMounted(initialize);

defineExpose({
    getFilters,
    reset: limpiar
});
</script>

<template>
    <v-form ref="frmFiltros" class="mt-5" @submit.prevent="buscar">
        <UiParentCard :title="title" :subtitle="subtitle" :icon="icon" :loading="loading"
            :hide-content="!mostrarFiltros"
            headerCardItemClass="py-2 px-6" footerCardItemClass="py-2 px-6">
            <div v-if="mostrarFiltros">
                <v-row>
                    <v-col v-for="item in renderedFields" :key="item.key" :cols="item.field.cols ?? 12"
                        :sm="item.field.sm ?? 6" :md="item.field.md ?? 4" :lg="item.field.lg ?? 3">
                        <component :is="item.component" :model-value="values[item.key]" v-bind="item.componentProps"
                            @update:model-value="
                                setValue(item.key, $event)
                                " />
                    </v-col>
                </v-row>
            </div>

            <template #footer>
                <v-btn size="20" icon variant="flat" class="text-muted" :aria-label="mostrarFiltros
                        ? 'Ocultar filtros'
                        : 'Mostrar filtros'
                    " @click="
                        mostrarFiltros = !mostrarFiltros
                        ">
                    <FilterMinusIcon v-if="mostrarFiltros" size="20" />

                    <FilterPlusIcon v-else size="20" />

                    <v-tooltip activator="parent">
                        {{
                            mostrarFiltros
                                ? 'Ocultar filtros'
                                : 'Mostrar filtros'
                        }}
                    </v-tooltip>
                </v-btn>
            </template>

            <template #footer-actions>
                <div>
                    <v-btn v-if="botonSecundario" type="button" color="primary" variant="outlined" class="mr-2"
                        :disabled="loading ||
                            resetting ||
                            validating
                            " @click="limpiar">
                        {{ botonSecundario }}
                    </v-btn>

                    <v-btn v-if="botonPrincipal" type="button" color="primary" :loading="loading || validating"
                        :disabled="loadingOptions ||
                            resetting ||
                            validating
                            " @click="buscar">
                        {{ botonPrincipal }}
                    </v-btn>
                </div>
            </template>
        </UiParentCard>
    </v-form>
</template>
