import type { AdmissionStage } from '@/mocks/convocatorias.mock';
import { ensureApplicantAdmissionsMock, moveApplicantStageMock, readApplicantAdmissionsMock, writeApplicantAdmissionsMock, type ApplicantAdmission } from '@/mocks/admissionOperational.store';
import { ref } from 'vue';
import type { RegistroPostulante } from '@/features/postulantes/postulantes.types';
import { nombreCompleto } from '@/features/postulantes/postulantes.helpers';
import { readConvocatoriasMock } from '@/mocks/convocatorias.store';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const admissions = ref<ApplicantAdmission[]>(readApplicantAdmissionsMock());
export type BuscarPostulantesParams = { search?: string; convocatoriaId?: string | null; stageId?: string | null };
export type PostulanteListadoItem = { id: number; postulante: string; convocatoria: string; convocatoriaId: string; grado: string; tutor: string; documento: string; etapa: string; etapaId: string; fecha: string; esRegistroInicial: boolean };
export type PostulantesListadoResultado = { items: PostulanteListadoItem[]; totalRegistroInicial: number; totalOtrasEtapas: number };

/** Feature contract. Only this service knows the temporary mock persistence. */
export const useAdmissionOperationalService = () => ({
    async obtenerAdmisiones(): Promise<ApplicantAdmission[]> { return clone(readApplicantAdmissionsMock()); },
    async obtenerAdmision(postulanteId: number): Promise<ApplicantAdmission | undefined> { return clone(readApplicantAdmissionsMock().find(item => item.postulanteId === postulanteId)); },
    async asegurarAdmisiones(postulanteIds: number[], convocatoriaId: string, etapas: AdmissionStage[]): Promise<ApplicantAdmission[]> { return clone(ensureApplicantAdmissionsMock(postulanteIds, convocatoriaId, etapas)); },
    async guardarAdmision(value: ApplicantAdmission): Promise<void> {
        const items = readApplicantAdmissionsMock(); const index = items.findIndex(item => item.postulanteId === value.postulanteId);
        if (index >= 0) items.splice(index, 1, clone(value)); else items.push(clone(value)); writeApplicantAdmissionsMock(items);
    },
    async moverEtapa(postulanteId: number, destinationId: string, observation = ''): Promise<boolean> { return moveApplicantStageMock(postulanteId, destinationId, observation); }
    ,async buscarPostulantes(registros: RegistroPostulante[], params: BuscarPostulantesParams = {}): Promise<PostulantesListadoResultado> {
        const convocatorias = readConvocatoriasMock();
        const admisiones = readApplicantAdmissionsMock();
        const search = params.search?.trim().toLowerCase() || '';
        const items = registros.map((registro) => {
            const admission = admisiones.find(item => item.postulanteId === registro.postulanteId);
            const convocatoria = convocatorias.find(item => item.id === admission?.convocatoriaId);
            const etapa = convocatoria?.etapas.find(item => item.id === admission?.etapaActualId);
            return { id: registro.postulanteId, postulante: nombreCompleto(registro.postulante), convocatoria: convocatoria?.nombre || 'Sin asignar', convocatoriaId: convocatoria?.id || '', grado: convocatoria?.grado || convocatoria?.nivel || '', tutor: nombreCompleto(registro.tutorPrincipal), documento: registro.postulante.documentoIdentidad, etapa: etapa?.nombre || 'Registro inicial', etapaId: etapa?.id || '', fecha: admission?.fechaRegistro ? new Date(admission.fechaRegistro).toLocaleDateString() : '—', esRegistroInicial: etapa?.id === convocatoria?.etapas.slice().sort((a, b) => a.orden - b.orden)[0]?.id };
        }).filter(item => (!params.convocatoriaId || item.convocatoriaId === params.convocatoriaId) && (!params.stageId || item.etapaId === params.stageId) && (!search || `${item.postulante} ${item.tutor} ${item.documento}`.toLowerCase().includes(search)));
        const totalRegistroInicial = items.filter(item => item.esRegistroInicial).length;
        return { items: clone(items), totalRegistroInicial, totalOtrasEtapas: items.length - totalRegistroInicial };
    }
});

/** Reactive cache for presentation code while services retain the async API contract above. */
export const useAdmissionOperationalCache = () => ({
    admissions,
    refresh: () => { admissions.value = readApplicantAdmissionsMock(); },
    find: (postulanteId: number) => admissions.value.find(item => item.postulanteId === postulanteId),
    ensure: (ids: number[], convocatoriaId: string, etapas: AdmissionStage[]) => { admissions.value = ensureApplicantAdmissionsMock(ids, convocatoriaId, etapas); },
    move: (id: number, stageId: string, observation = '') => { const changed = moveApplicantStageMock(id, stageId, observation); admissions.value = readApplicantAdmissionsMock(); return changed; },
    persist: () => writeApplicantAdmissionsMock(admissions.value)
});
const cache = useAdmissionOperationalCache();
export const applicantAdmissions = cache.admissions;
export const refreshApplicantAdmissions = cache.refresh;
export const admissionFor = cache.find;
export const ensureApplicantAdmissions = (registros: Array<{ postulanteId: number }>, convocatoriaId: string, etapas: AdmissionStage[]) => cache.ensure(registros.map(item => item.postulanteId), convocatoriaId, etapas);
export const moveApplicantStage = cache.move;
export const persistApplicantAdmissions = cache.persist;
