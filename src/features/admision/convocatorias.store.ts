import { ref } from 'vue';
import { type Convocatoria, type ConvocatoriaEstado } from './convocatorias.mock';
import { useConvocatoriasService } from './convocatorias.services';

const service = useConvocatoriasService();

export const convocatorias = ref<Convocatoria[]>(service.fetchAll());
const persist = () => service.saveAll(convocatorias.value);
/** Reloads the persisted mock configuration, including changes made in another browser tab. */
export function refreshConvocatorias() { convocatorias.value = service.fetchAll(); }
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (service.hasExternalChange(event)) refreshConvocatorias();
    });
}

export const resolveEstado = (item: Pick<Convocatoria, 'publicada' | 'finalizada' | 'apertura' | 'cierre'>): ConvocatoriaEstado => {
    if (item.finalizada) return 'Finalizada';
    if (!item.publicada) return 'Borrador';
    const now = new Date();
    if (now < new Date(item.apertura)) return 'Programada';
    if (now > new Date(item.cierre)) return 'Cerrada';
    return 'Abierta';
};

export function getConvocatoria(id: string) { return convocatorias.value.find((item) => item.id === id); }
export function saveConvocatoria(item: Convocatoria) {
    const value = { ...item, estado: resolveEstado(item) };
    const index = convocatorias.value.findIndex((current) => current.id === value.id);
    if (index >= 0) convocatorias.value.splice(index, 1, value);
    else convocatorias.value.unshift(value);
    persist();
    return value;
}
export function nextConvocatoriaId() { return `local-${Date.now()}`; }
