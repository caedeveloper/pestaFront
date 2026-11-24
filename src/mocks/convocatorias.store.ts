import { type AdmissionCall, type AdmissionCallStatus, convocatoriasMock } from './convocatorias.mock';

const storageKey = 'heinrich-admision-convocatorias';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function readConvocatoriasMock(): AdmissionCall[] {
    if (typeof window === 'undefined') return clone(convocatoriasMock);
    try { return clone(JSON.parse(window.localStorage.getItem(storageKey) || 'null') || convocatoriasMock); } catch { return clone(convocatoriasMock); }
}
export function writeConvocatoriasMock(items: AdmissionCall[]): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export const resolveEstado = (item: Pick<AdmissionCall, 'publicada' | 'finalizada' | 'apertura' | 'cierre'>): AdmissionCallStatus => {
    if (item.finalizada) return 'Finalizada';
    if (!item.publicada) return 'Borrador';
    const now = new Date();
    if (now < new Date(item.apertura)) return 'Programada';
    if (now > new Date(item.cierre)) return 'Cerrada';
    return 'Abierta';
};

export function saveConvocatoriaMock(item: AdmissionCall): AdmissionCall {
    const value = { ...item, estado: resolveEstado(item) };
    const items = readConvocatoriasMock();
    const index = items.findIndex((current) => current.id === value.id);
    if (index >= 0) items.splice(index, 1, value); else items.unshift(value);
    writeConvocatoriasMock(items);
    return value;
}
export function nextConvocatoriaMockId() { return `local-${Date.now()}`; }
