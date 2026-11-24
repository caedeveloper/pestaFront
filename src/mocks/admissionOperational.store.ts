import type { AdmissionStage } from './convocatorias.mock';

export type UploadedAdmissionFile = { nombre: string; tipo: string; tamano: number; dataUrl?: string; cargadoEn: string };
export type AdmissionActionResponse = { documentos?: Record<string, UploadedAdmissionFile>; confirmado?: boolean; confirmadoEn?: string; confirmadoPor?: string };
export type AdmissionHistory = { origenId?: string; destinoId: string; fecha: string; observacion?: string; responsable?: string };
export type ApplicantAdmission = { postulanteId: number; convocatoriaId: string; etapaActualId: string; fechaRegistro: string; respuestas: Record<string, AdmissionActionResponse>; historial: AdmissionHistory[] };

const storageKey = 'heinrich-admision-operacion-v1';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
export function readApplicantAdmissionsMock(): ApplicantAdmission[] {
    if (typeof window === 'undefined') return [];
    try { return clone(JSON.parse(window.localStorage.getItem(storageKey) || '[]') as ApplicantAdmission[]); } catch { return []; }
}
export function writeApplicantAdmissionsMock(items: ApplicantAdmission[]): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(items));
}
export function ensureApplicantAdmissionsMock(postulanteIds: number[], convocatoriaId: string, stages: AdmissionStage[]): ApplicantAdmission[] {
    const firstStage = stages.slice().sort((a, b) => a.orden - b.orden)[0];
    const items = readApplicantAdmissionsMock();
    if (!firstStage) return items;
    let changed = false;
    postulanteIds.forEach((postulanteId, index) => {
        if (items.some(item => item.postulanteId === postulanteId)) return;
        const stage = stages[index % stages.length] || firstStage;
        items.push({ postulanteId, convocatoriaId, etapaActualId: stage.id, fechaRegistro: new Date().toISOString(), respuestas: {}, historial: [{ destinoId: stage.id, fecha: new Date().toISOString(), responsable: 'Sistema mock' }] });
        changed = true;
    });
    if (changed) writeApplicantAdmissionsMock(items);
    return clone(items);
}
export function moveApplicantStageMock(postulanteId: number, destinationId: string, observation = ''): boolean {
    const items = readApplicantAdmissionsMock(); const item = items.find(value => value.postulanteId === postulanteId);
    if (!item || item.etapaActualId === destinationId) return false;
    const originId = item.etapaActualId; item.etapaActualId = destinationId;
    item.historial.push({ origenId: originId, destinoId: destinationId, fecha: new Date().toISOString(), observacion: observation || undefined, responsable: 'Personal de admisión' });
    writeApplicantAdmissionsMock(items); return true;
}
