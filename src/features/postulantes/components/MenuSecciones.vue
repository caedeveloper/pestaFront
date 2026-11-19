<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { SeccionEstado } from '../postulantes.types';

const props = defineProps<{ secciones: SeccionEstado[] }>();
const activa = ref(props.secciones[0]?.id);

function arco(indice: number, total: number) {
    const vuelta = Math.PI * 2;
    const hueco = Math.min(0.28, (vuelta / total) * 0.18);
    const inicio = -Math.PI / 2 + indice * (vuelta / total) + hueco / 2;
    const fin = inicio + vuelta / total - hueco;
    const radio = 42;
    const x1 = 50 + radio * Math.cos(inicio);
    const y1 = 50 + radio * Math.sin(inicio);
    const x2 = 50 + radio * Math.cos(fin);
    const y2 = 50 + radio * Math.sin(fin);
    const grande = fin - inicio > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radio} ${radio} 0 ${grande} 1 ${x2} ${y2}`;
}

function irA(id: string) {
    activa.value = id;
    document.getElementById('seccion-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function actualizarSeccionActiva() {
    let actual = props.secciones[0]?.id;
    for (const seccion of props.secciones) {
        const elemento = document.getElementById('seccion-' + seccion.id);
        if (elemento && elemento.getBoundingClientRect().top <= 180) actual = seccion.id;
    }
    activa.value = actual;
}

onMounted(() => {
    actualizarSeccionActiva();
    window.addEventListener('scroll', actualizarSeccionActiva, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', actualizarSeccionActiva));
</script>

<template>
    <v-menu open-on-hover location="top end">
        <template #activator="{ props: activador }">
            <div class="admission-section-trigger">
                <svg class="admission-section-ring" viewBox="0 0 100 100" aria-hidden="true">
                    <circle v-if="secciones.length === 1" cx="50" cy="50" r="42" :class="secciones[0].completa ? 'is-complete' : 'is-pending'" />
                    <template v-else>
                        <path v-for="(seccion, indice) in secciones" :key="seccion.id" :d="arco(indice, secciones.length)" :class="seccion.completa ? 'is-complete' : 'is-pending'" />
                    </template>
                </svg>
                <v-btn v-bind="activador" icon="mdi-format-list-bulleted" color="primary" aria-label="Ver secciones" />
            </div>
        </template>
        <v-card min-width="260">
            <v-card-title class="admission-section-title">Secciones</v-card-title>
            <v-list density="compact" nav>
                <v-list-item
                    v-for="seccion in secciones"
                    :key="seccion.id"
                    :title="seccion.titulo"
                    :prepend-icon="seccion.completa ? 'mdi-check-circle' : 'mdi-circle-outline'"
                    :active="seccion.id === activa"
                    @click="irA(seccion.id)"
                />
            </v-list>
        </v-card>
    </v-menu>
</template>

<style scoped>
.admission-section-trigger {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 6;
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
}

.admission-section-ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.admission-section-ring path,
.admission-section-ring circle {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
}

.admission-section-ring .is-pending { stroke: rgba(var(--v-theme-success), .28); }
.admission-section-ring .is-complete { stroke: rgb(var(--v-theme-success)); }
</style>
