import type { DataTableQuery, PagedResponse } from '@/components/heinrich/heinrich-data-table/data-table.types';
import type { AdmissionStage } from '@/features/admission-calls/admission-calls.types';
import type { RegistroPostulante } from '@/features/postulantes/postulantes.types';

export interface UploadedApplicantDocument {
    nombre: string;
    tipo: string;
    tamano: number;
    dataUrl?: string;
    cargadoEn: string;
}
export interface ApplicantActivityResponse {
    documentos?: Record<string, UploadedApplicantDocument>;
    confirmado?: boolean;
    confirmadoEn?: string;
    confirmadoPor?: string;
}
export interface ApplicantApplicationHistory {
    origenId?: string;
    destinoId: string;
    fecha: string;
    observacion?: string;
    responsable?: string;
}
export interface ApplicantApplication {
    postulanteId: number;
    convocatoriaId: string;
    etapaActualId: string;
    fechaRegistro: string;
    respuestas: Record<string, ApplicantActivityResponse>;
    historial: ApplicantApplicationHistory[];
}
export interface BuscarApplicantApplicationsRequest {
    search?: string;
    convocatoriaId?: string | null;
    stageId?: string | null;
}
export interface BuscarApplicantApplicationsPaginadoRequest extends BuscarApplicantApplicationsRequest {
    pagination: DataTableQuery<ApplicantApplicationListItem>;
    registros: RegistroPostulante[];
}
export interface ApplicantApplicationListItem {
    id: number;
    postulante: string;
    convocatoria: string;
    convocatoriaId: string;
    grado: string;
    tutor: string;
    documento: string;
    etapa: string;
    etapaId: string;
    fecha: string;
    esRegistroInicial: boolean;
}
export type BuscarApplicantApplicationsResponse = PagedResponse<ApplicantApplicationListItem>;
export interface MoverApplicantApplicationStageRequest {
    postulanteId: number;
    destinoId: string;
    observacion?: string;
    stages: AdmissionStage[];
}
