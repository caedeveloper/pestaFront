<script setup lang="ts">
import { useRouter } from 'vue-router';
import { DotsVerticalIcon, PlusIcon } from 'vue-tabler-icons';

import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import HeinrichDataTable from '@/components/heinrich/heinrich-data-table/HeinrichDataTable.vue';
import HeinrichStatusChip from '@/components/heinrich/HeinrichStatusChip.vue';

import useDataTableFetch from '@/components/heinrich/heinrich-data-table/useDataTableFetch';

import FrmFiltrarAdmissionCall from '../components/FrmFiltrarAdmissionCall.vue';
import useAdmissionCallsService from '../admission-calls.services';

import {
    ADMISSION_CALL_COLUMNS,
    ADMISSION_CALL_TABLE_DEFAULTS
} from '../admission-calls.constants';

import type {
    AdmissionCall,
    BuscarAdmissionCallsRequest
} from '../admission-calls.types';

const router = useRouter();
const service = useAdmissionCallsService();

// #region Data

const {
    state,
    query,
    buscar,
    errorMessage,
    limpiarError
} = useDataTableFetch<
    AdmissionCall,
    BuscarAdmissionCallsRequest
>(
    service.buscarAdmissionCalls,
    {
        initialFilters: {}
    }
);

// #endregion

// #region Navigation

function registrarAdmissionCall(): void {
    router.push({
        name: 'admision-convocatoria-nueva'
    });
}

function configurarAdmissionCall(id: string): void {
    router.push({
        name: 'admision-convocatoria-configurar',
        params: { id }
    });
}

// #endregion
</script>

<template>
    <HeinrichHeroBanner
        title="Admisión"
        subtitle="Administración de convocatorias"
    />

    <div class="d-flex justify-end mb-6 mt-n3">
        <v-btn
            color="primary"
            :prepend-icon="PlusIcon"
            @click="registrarAdmissionCall"
        >
            Nueva convocatoria
        </v-btn>
    </div>

    <FrmFiltrarAdmissionCall
        class="mb-6"
        @buscar="buscar"
    />

    <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="limpiarError"
    >
        {{ errorMessage }}
    </v-alert>

    <UiParentCard
        title="Convocatorias registradas"
        icon="mdi-calendar-text-outline"
    >
        <HeinrichDataTable
            v-model:query="query"
            :columns="ADMISSION_CALL_COLUMNS"
            :defaults="ADMISSION_CALL_TABLE_DEFAULTS"
            :state="state"
            row-key="id"
        >
            <template #item-estado="{ item }">
                <HeinrichStatusChip :status="item.estado" />
            </template>

            <template #item-id="{ item }">
                <v-menu>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            size="small"
                            aria-label="Acciones de la convocatoria"
                        >
                            <DotsVerticalIcon size="20" />

                            <v-tooltip activator="parent">
                                Ver acciones
                            </v-tooltip>
                        </v-btn>
                    </template>

                    <v-list density="compact">
                        <v-list-item
                            title="Configurar"
                            @click="configurarAdmissionCall(item.id)"
                        />

                        <v-list-item
                            title="Ver postulaciones"
                            subtitle="Próximamente"
                            disabled
                        />
                    </v-list>
                </v-menu>
            </template>
        </HeinrichDataTable>
    </UiParentCard>
</template>