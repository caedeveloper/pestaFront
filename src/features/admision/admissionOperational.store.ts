import { ref } from 'vue';
import type { RegistroPostulante } from '@/features/postulantes/postulantes.types';
import type { AdmissionStage } from './convocatorias.mock';
import { useAdmissionOperationalService } from './admissionOperational.services';

export type UploadedAdmissionFile = { nombre: string; tipo: string; tamano: number; dataUrl?: string; cargadoEn: string };
export type AdmissionActionResponse = { documentos?: Record<string, UploadedAdmissionFile>; confirmado?: boolean; confirmadoEn?: string; confirmadoPor?: string };
export type AdmissionHistory = { origenId?: string; destinoId: string; fecha: string; observacion?: string; responsable?: string };
export type ApplicantAdmission = { postulanteId: number; convocatoriaId: string; etapaActualId: string; fechaRegistro: string; respuestas: Record<string, AdmissionActionResponse>; historial: AdmissionHistory[] };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const service = useAdmissionOperationalService();
export const applicantAdmissions = ref<ApplicantAdmission[]>(service.fetchAll());
const persist = () => service.saveAll(applicantAdmissions.value);
export function refreshApplicantAdmissions() { applicantAdmissions.value = service.fetchAll(); }
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => { if (service.hasExternalChange(event)) refreshApplicantAdmissions(); });
}

export function ensureApplicantAdmissions(registros: RegistroPostulante[], convocatoriaId: string, stages: AdmissionStage[]) {
    const firstStage = stages.slice().sort((a, b) => a.orden - b.orden)[0];
    if (!firstStage) return;
    let changed = false;
    registros.forEach((registro, index) => {
        if (applicantAdmissions.value.some(item => item.postulanteId === registro.postulanteId)) return;
        const stage = stages[index % stages.length] || firstStage;
        applicantAdmissions.value.push({ postulanteId: registro.postulanteId, convocatoriaId, etapaActualId: stage.id, fechaRegistro: new Date().toISOString(), respuestas: {}, historial: [{ destinoId: stage.id, fecha: new Date().toISOString(), responsable: 'Sistema mock' }] });
        changed = true;
    });
    if (changed) persist();
}
export function admissionFor(postulanteId: number) { return applicantAdmissions.value.find(item => item.postulanteId === postulanteId); }
export function saveAdmission(value: ApplicantAdmission) {
    const index = applicantAdmissions.value.findIndex(item => item.postulanteId === value.postulanteId);
    if (index >= 0) applicantAdmissions.value.splice(index, 1, clone(value)); else applicantAdmissions.value.push(clone(value));
    persist();
}
export function moveApplicantStage(postulanteId: number, destinationId: string, observation = '') {
    const item = admissionFor(postulanteId); if (!item || item.etapaActualId === destinationId) return false;
    const originId = item.etapaActualId; item.etapaActualId = destinationId;
    item.historial.push({ origenId: originId, destinoId: destinationId, fecha: new Date().toISOString(), observacion: observation || undefined, responsable: 'Personal de admisión' });
    persist(); return true;
}
export function persistApplicantAdmissions() { persist(); }
