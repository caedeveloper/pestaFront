import type { AdmissionStage } from '@/mocks/convocatorias.mock';
import { ensureApplicantAdmissionsMock, moveApplicantStageMock, readApplicantAdmissionsMock, writeApplicantAdmissionsMock, type ApplicantAdmission } from '@/mocks/admissionOperational.store';
import { ref } from 'vue';
import type { RegistroPostulante } from '@/features/postulantes/postulantes.types';
import { nombreCompleto } from '@/features/postulantes/postulantes.helpers';
import { readConvocatoriasMock } from '@/mocks/convocatorias.store';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const applicantApplicationsCache = ref<ApplicantAdmission[]>(readApplicantAdmissionsMock());
export type BuscarApplicantApplicationsRequest = { search?: string; convocatoriaId?: string | null; stageId?: string | null };
export type ApplicantApplicationListItem = { id: number; postulante: string; convocatoria: string; convocatoriaId: string; grado: string; tutor: string; documento: string; etapa: string; etapaId: string; fecha: string; esRegistroInicial: boolean };
export type BuscarApplicantApplicationsResponse = { items: ApplicantApplicationListItem[]; totalRegistroInicial: number; totalOtrasEtapas: number };

/** Feature contract. Only this service knows the temporary mock persistence. */
export const useApplicantApplicationsService = () => ({
    async obtenerApplicantApplications(): Promise<ApplicantAdmission[]> { return clone(readApplicantAdmissionsMock()); },
    async obtenerApplicantApplication(postulanteId: number): Promise<ApplicantAdmission | undefined> { return clone(readApplicantAdmissionsMock().find(item => item.postulanteId === postulanteId)); },
    async asegurarApplicantApplications(postulanteIds: number[], convocatoriaId: string, etapas: AdmissionStage[]): Promise<ApplicantAdmission[]> { return clone(ensureApplicantAdmissionsMock(postulanteIds, convocatoriaId, etapas)); },
    async guardarApplicantApplication(value: ApplicantAdmission): Promise<void> {
        const items = readApplicantAdmissionsMock(); const index = items.findIndex(item => item.postulanteId === value.postulanteId);
        if (index >= 0) items.splice(index, 1, clone(value)); else items.push(clone(value)); writeApplicantAdmissionsMock(items);
    },
    async moverApplicantApplicationStage(postulanteId: number, destinationId: string, observation = ''): Promise<boolean> { return moveApplicantStageMock(postulanteId, destinationId, observation); }
    ,async buscarApplicantApplications(registros: RegistroPostulante[], params: BuscarApplicantApplicationsRequest = {}): Promise<BuscarApplicantApplicationsResponse> {
        const admissionCalls = readConvocatoriasMock();
        const admisiones = readApplicantAdmissionsMock();
        const search = params.search?.trim().toLowerCase() || '';
        const items = registros.map((registro) => {
            const admission = admisiones.find(item => item.postulanteId === registro.postulanteId);
            const convocatoria = admissionCalls.find(item => item.id === admission?.convocatoriaId);
            const etapa = convocatoria?.etapas.find(item => item.id === admission?.etapaActualId);
            return { id: registro.postulanteId, postulante: nombreCompleto(registro.postulante), convocatoria: convocatoria?.nombre || 'Sin asignar', convocatoriaId: convocatoria?.id || '', grado: convocatoria?.grado || convocatoria?.nivel || '', tutor: nombreCompleto(registro.tutorPrincipal), documento: registro.postulante.documentoIdentidad, etapa: etapa?.nombre || 'Registro inicial', etapaId: etapa?.id || '', fecha: admission?.fechaRegistro ? new Date(admission.fechaRegistro).toLocaleDateString() : '—', esRegistroInicial: etapa?.id === convocatoria?.etapas.slice().sort((a, b) => a.orden - b.orden)[0]?.id };
        }).filter(item => (!params.convocatoriaId || item.convocatoriaId === params.convocatoriaId) && (!params.stageId || item.etapaId === params.stageId) && (!search || `${item.postulante} ${item.tutor} ${item.documento}`.toLowerCase().includes(search)));
        const totalRegistroInicial = items.filter(item => item.esRegistroInicial).length;
        return { items: clone(items), totalRegistroInicial, totalOtrasEtapas: items.length - totalRegistroInicial };
    }
});

/** Reactive cache for presentation code while services retain the async API contract above. */
export const useApplicantApplicationsCache = () => ({
    applicantApplicationsCache,
    actualizarApplicantApplications: () => { applicantApplicationsCache.value = readApplicantAdmissionsMock(); },
    obtenerApplicantApplication: (postulanteId: number) => applicantApplicationsCache.value.find(item => item.postulanteId === postulanteId),
    asegurarApplicantApplications: (ids: number[], convocatoriaId: string, etapas: AdmissionStage[]) => { applicantApplicationsCache.value = ensureApplicantAdmissionsMock(ids, convocatoriaId, etapas); },
    moverApplicantApplicationStage: (id: number, stageId: string, observation = '') => { const changed = moveApplicantStageMock(id, stageId, observation); applicantApplicationsCache.value = readApplicantAdmissionsMock(); return changed; },
    persistirApplicantApplications: () => writeApplicantAdmissionsMock(applicantApplicationsCache.value)
});
const cache = useApplicantApplicationsCache();
export const applicantApplications = cache.applicantApplicationsCache;
export const actualizarApplicantApplicationsCache = cache.actualizarApplicantApplications;
export const obtenerApplicantApplicationCache = cache.obtenerApplicantApplication;
export const asegurarApplicantApplicationsCache = (registros: Array<{ postulanteId: number }>, convocatoriaId: string, etapas: AdmissionStage[]) => cache.asegurarApplicantApplications(registros.map(item => item.postulanteId), convocatoriaId, etapas);
export const moverApplicantApplicationStageCache = cache.moverApplicantApplicationStage;
export const persistirApplicantApplicationsCache = cache.persistirApplicantApplications;
