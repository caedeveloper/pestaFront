import { ref } from 'vue';
import { convocatoriasMock, type Convocatoria, type ConvocatoriaEstado } from './convocatorias.mock';
import { legacyStageTutorPermissions } from './stageTutorPermissions';

const storageKey = 'heinrich-admision-convocatorias';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const read = (): Convocatoria[] => {
    if (typeof window === 'undefined') return clone(convocatoriasMock);
    try {
        const saved = window.localStorage.getItem(storageKey);
        return saved ? (JSON.parse(saved) as Convocatoria[]).map((item) => ({ ...item, etapas: (item.etapas || []).map((stage) => ({ ...stage, workflowIds: stage.workflowIds || [], secciones: stage.secciones || [], connectionIds: stage.connectionIds || [], tutorPermissions: { ...legacyStageTutorPermissions, ...(stage.tutorPermissions || {}) } })) })) : clone(convocatoriasMock);
    } catch { return clone(convocatoriasMock); }
};

export const convocatorias = ref<Convocatoria[]>(read());
const persist = () => window.localStorage.setItem(storageKey, JSON.stringify(convocatorias.value));

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
