<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EyeIcon } from 'vue-tabler-icons';
import HeinrichHeroBanner from '@/components/heinrich/HeinrichHeroBanner.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import HeinrichDataTable, { type HeinrichColumn } from '@/components/heinrich/HeinrichDataTable.vue';
import HeinrichFilterCard from '@/components/heinrich/filters/HeinrichFilterCard.vue';
import { defineFilters, type FilterValues } from '@/components/heinrich/filters/filter.types';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import { convocatorias, refreshConvocatorias } from '@/features/convocatorias/convocatorias.services';
import { admissionFor, ensureApplicantAdmissions } from '../solicitudes-postulantes.services';
import { nombreCompleto } from '@/features/postulantes/postulantes.helpers';
const router = useRouter(); const store = useRegistroPostulanteStore(); const search = ref(''); const convocatoriaId = ref<string | null>(null); const stageId = ref<string | null>(null);
onMounted(async () => { refreshConvocatorias(); await store.cargarRegistro(); const current = convocatorias.value.find(item => item.etapas.length) || convocatorias.value[0]; if (current) ensureApplicantAdmissions(store.registros, current.id, current.etapas); });
const filterModel = computed(() => defineFilters({
    search: { 
        type: 'text',
        label: 'Buscar por postulante, tutor o documento',
        defaultValue: '',
        cols: 12,
        md: 5 },
    convocatoriaId: { 
        type: 'select',
        label: 'Convocatoria',
        items: convocatorias.value,
        itemTitle: 'nombre',
        itemValue: 'id',
        cols: 12,
        md: 4 },
    stageId: {
        type: 'select', label: 'Etapa', dependsOn: ['convocatoriaId'], itemTitle: 'nombre', itemValue: 'id', cols: 12, md: 3,
        loadOptions: async filters => convocatorias.value.find(item => item.id === filters.convocatoriaId)?.etapas ?? []
    }
}));
const rows = computed(() => store.registros.map(registro => { const admission = admissionFor(registro.postulanteId); const call = convocatorias.value.find(item => item.id === admission?.convocatoriaId); const stage = call?.etapas.find(item => item.id === admission?.etapaActualId); return { id: registro.postulanteId, postulante: nombreCompleto(registro.postulante), convocatoria: call?.nombre || 'Sin asignar', convocatoriaId: call?.id || '', grado: call?.grado || call?.nivel || '', tutor: nombreCompleto(registro.tutorPrincipal), documento: registro.postulante.documentoIdentidad, etapa: stage?.nombre || 'Registro inicial', etapaId: stage?.id || '', fecha: admission?.fechaRegistro ? new Date(admission.fechaRegistro).toLocaleDateString() : '—' }; }).filter(row => (!convocatoriaId.value || row.convocatoriaId === convocatoriaId.value) && (!stageId.value || row.etapaId === stageId.value) && (!search.value.trim() || `${row.postulante} ${row.tutor} ${row.documento}`.toLowerCase().includes(search.value.toLowerCase()))));
const initialCount = computed(() => rows.value.filter(row => row.etapaId === (convocatorias.value.find(item => item.id === row.convocatoriaId)?.etapas[0]?.id)).length);
const columns: HeinrichColumn<(typeof rows.value)[number]>[] = [
    { title: 'Postulante', key: 'postulante' }, { title: 'Convocatoria', key: 'convocatoria' }, { title: 'Nivel / grado', key: 'grado' },
    { title: 'Tutor responsable', key: 'tutor' }, { title: 'Etapa actual', key: 'etapa' }, { title: 'Fecha de registro', key: 'fecha' },
    { title: 'Acciones', key: 'id', align: 'center', width: '76px' }
];
function buscar(filters: FilterValues) {
    search.value = typeof filters.search === 'string' ? filters.search : '';
    convocatoriaId.value = typeof filters.convocatoriaId === 'string' ? filters.convocatoriaId : null;
    stageId.value = typeof filters.stageId === 'string' ? filters.stageId : null;
}
</script>
<template>
    <section>
        <HeinrichHeroBanner title="Postulantes"
            subtitle="Consulta y administra los postulantes registrados en los procesos de admisión." /><v-row
            class="mb-2"><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text>
                        <div class="text-caption">Total de postulantes registrados</div>
                        <div class="text-h5">{{ rows.length }}</div>
                    </v-card-text></v-card></v-col><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text>
                        <div class="text-caption">Postulantes en registro inicial</div>
                        <div class="text-h5">{{ initialCount }}</div>
                    </v-card-text></v-card></v-col><v-col cols="12" md="4"><v-card variant="outlined"><v-card-text>
                        <div class="text-caption">Postulantes en otras etapas</div>
                        <div class="text-h5">{{ rows.length - initialCount }}</div>
                    </v-card-text></v-card></v-col></v-row>
        <HeinrichFilterCard :model="filterModel" class="mb-6" @search="buscar" @reset="buscar" />
        <UiParentCard title="Listado de postulantes" icon="mdi-account-group-outline"><v-empty-state v-if="!rows.length"
                icon="mdi-account-search-outline" title="Sin resultados"
                text="No hay postulantes que coincidan con los filtros seleccionados." />
            <HeinrichDataTable v-else :columns="columns" :rows="rows" row-key="id"><template
                    #item-postulante="{ item }">
                    <span class="postulante-name">{{ item.postulante }}</span>
                </template><template #item-tutor="{ item }">
                    <span class="postulante-name">{{ item.tutor }}</span>
                </template><template #item-id="{ item }"><v-btn size="small" variant="tonal" color="default"
                        @click="router.push({ name: 'admision-postulante-detalle', params: { postulanteId: item.id } })">
                        <EyeIcon color="black" />
                        <v-tooltip activator="parent">Ver detalle</v-tooltip>
                    </v-btn></template></HeinrichDataTable>
        </UiParentCard>
    </section>
</template>
<style scoped>
.postulante-name {
    display: inline-block;
    max-width: 220px;
    overflow-wrap: break-word;
    white-space: normal;
}
</style>
