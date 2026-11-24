import { admissionCallsStore } from '@/features/admission-calls/mocks/admission-calls.store';
import type { AdmissionCall, AdmissionStage } from '@/features/admission-calls/admission-calls.types';
import usePostulantesService from '@/features/postulantes/postulantes.services';
import { nombreCompleto } from '@/features/postulantes/postulantes.helpers';
import { obtenerPrimerStage } from '../applicant-applications.helpers';
import type {
    ApplicantApplication, ApplicantApplicationDetail, ApplicantApplicationListItem, ApplicantApplicationSummary,
    BuscarApplicantApplicationsPaginadoRequest, BuscarApplicantApplicationsResponse,
    BuscarApplicantApplicationsRequest, MoverApplicantApplicationStageRequest
} from '../applicant-applications.types';
import { applicantApplicationsStore } from './applicant-applications.store';

function destinos(call: AdmissionCall, origin: AdmissionStage): AdmissionStage[] {
    return call.etapas.filter(item => item.id !== origin.id &&
        (origin.connectionIds.includes(item.id) || item.connectionIds.includes(origin.id)));
}

async function rows(filters: BuscarApplicantApplicationsRequest): Promise<ApplicantApplicationListItem[]> {
    const registros = (await usePostulantesService().fetchRegistro()).registros;
    const applications = applicantApplicationsStore.list();
    const calls = admissionCallsStore.list();
    const term = filters.search?.trim().toLowerCase() ?? '';
    return registros.map(registro => {
        const application = applications.find(item => item.postulanteId === registro.postulanteId);
        const call = calls.find(item => item.id === application?.convocatoriaId);
        const stage = call?.etapas.find(item => item.id === application?.etapaActualId);
        const initialStage = obtenerPrimerStage(call?.etapas ?? []);
        return {
            id: registro.postulanteId,
            postulante: nombreCompleto(registro.postulante),
            convocatoria: call?.nombre ?? 'Sin asignar',
            convocatoriaId: call?.id ?? '',
            grado: call?.grado || call?.nivel || '',
            tutor: nombreCompleto(registro.tutorPrincipal),
            documento: registro.postulante.documentoIdentidad,
            etapa: stage?.nombre ?? 'Sin etapa asignada',
            etapaId: stage?.id ?? '',
            fecha: application?.fechaRegistro ?? '',
            esRegistroInicial: stage !== undefined && initialStage !== undefined && stage.id === initialStage.id
        };
    }).filter(item =>
        (!filters.convocatoriaId || item.convocatoriaId === filters.convocatoriaId) &&
        (!filters.stageId || item.etapaId === filters.stageId) &&
        (!term || `${item.postulante} ${item.tutor} ${item.documento}`.toLowerCase().includes(term)));
}

export const applicantApplicationsMock = {
    async obtenerApplicantApplication(postulanteId: number): Promise<ApplicantApplication | undefined> {
        return applicantApplicationsStore.get(postulanteId);
    },
    async obtenerApplicantApplicationDetail(postulanteId: number): Promise<ApplicantApplicationDetail | undefined> {
        const registro = (await usePostulantesService().fetchRegistro()).registros.find(item => item.postulanteId === postulanteId);
        if (!registro) return undefined;
        const application = applicantApplicationsStore.get(postulanteId);
        const convocatoria = application ? admissionCallsStore.get(application.convocatoriaId) : undefined;
        const etapaActual = convocatoria?.etapas.find(item => item.id === application?.etapaActualId);
        return {
            registro, application, convocatoria, etapaActual,
            destinosDisponibles: convocatoria && etapaActual ? destinos(convocatoria, etapaActual) : []
        };
    },
    async guardarApplicantApplication(item: ApplicantApplication): Promise<ApplicantApplication> {
        return applicantApplicationsStore.set(item);
    },
    async buscarApplicantApplications(request: BuscarApplicantApplicationsPaginadoRequest): Promise<BuscarApplicantApplicationsResponse> {
        const { pagination } = request;
        if (!Number.isInteger(pagination.page) || pagination.page < 1 ||
            !Number.isInteger(pagination.itemsPerPage) || pagination.itemsPerPage < 1 || pagination.itemsPerPage > 100)
            throw new Error('Paginación inválida.');
        const items = await rows(request);
        if (pagination.sort) {
            const { key, direction } = pagination.sort;
            items.sort((a, b) => {
                const first = key === 'fecha' ? Date.parse(a.fecha) || 0 : String(a[key] ?? '');
                const second = key === 'fecha' ? Date.parse(b.fecha) || 0 : String(b[key] ?? '');
                const result = typeof first === 'number' && typeof second === 'number'
                    ? first - second
                    : new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' }).compare(String(first), String(second));
                return direction === 'desc' ? -result : result;
            });
        }
        const start = (pagination.page - 1) * pagination.itemsPerPage;
        return { items: items.slice(start, start + pagination.itemsPerPage), totalItems: items.length };
    },
    async obtenerApplicantApplicationSummary(filters: BuscarApplicantApplicationsRequest): Promise<ApplicantApplicationSummary> {
        const items = await rows(filters);
        return {
            totalPostulantes: items.length,
            totalRegistroInicial: items.filter(item => item.esRegistroInicial).length,
            totalOtrasEtapas: items.filter(item => item.etapaId && !item.esRegistroInicial).length
        };
    },
    async moverApplicantApplicationStage(request: MoverApplicantApplicationStageRequest): Promise<ApplicantApplication> {
        const application = applicantApplicationsStore.get(request.postulanteId);
        if (!application) throw new Error('No se encontró la postulación.');
        const call = admissionCallsStore.get(application.convocatoriaId);
        if (!call) throw new Error('No se encontró la convocatoria.');
        const origin = call.etapas.find(item => item.id === application.etapaActualId);
        const destination = call.etapas.find(item => item.id === request.destinoId);
        if (!origin || !destination || !destinos(call, origin).some(item => item.id === destination.id))
            throw new Error('El movimiento de etapa no está permitido.');
        application.etapaActualId = destination.id;
        application.historial.push({
            origenId: origin.id, destinoId: destination.id, fecha: new Date().toISOString(),
            observacion: request.observacion?.trim() || undefined, responsable: 'Personal de admisión'
        });
        return applicantApplicationsStore.set(application);
    }
};
