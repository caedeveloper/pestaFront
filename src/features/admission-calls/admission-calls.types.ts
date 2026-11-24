import type {
    DataTableQuery,
    PagedResponse
} from '@/components/heinrich/heinrich-data-table/data-table.types';

// #region AdmissionCall

export interface AdmissionCall {
    id: string;
    nombre: string;
    descripcion?: string;
    anio: string;
    nivel: string;
    grado: string;
    tipoAlcance: string;
    apertura: string;
    cierre: string;
    registros: number;
    cupos: number;
    postulantes: number;
    duracionReservaMinutos: number;
    publicada: boolean;
    finalizada: boolean;
    estado: string;
    estadoManual?: boolean;
    etapas: AdmissionStage[];
}

// #endregion

// #region Requests and Responses

export interface BuscarAdmissionCallsRequest {
    nombre?: string;
    anio?: string;
    grado?: string;
    estado?: string;
}

export interface BuscarAdmissionCallsPaginadoRequest
    extends BuscarAdmissionCallsRequest {

    pagination: DataTableQuery<AdmissionCall>;
}

export type BuscarAdmissionCallsResponse =
    PagedResponse<AdmissionCall>;

// #endregion

// #region Stage

export interface AdmissionStage {
    id: string;
    admissionCallId: string;
    nombre: string;
    descripcion: string;
    orden: number;
    fechaInicio: string;
    fechaCierre: string;
    fechaPublicacion: string;
    contenido: AdmissionContentItem[];
    connectionIds: string[];
    guardianPermissions: StageGuardianPermissions;
}

// #endregion

// #region Section

export interface AdmissionSection {
    id: string;
    nombre: string;
    descripcion?: string;
    orden: number;
    tipo: string;
    contenido: AdmissionContentItem[];
}

// #endregion

// #region Activity

export interface AdmissionActivity {
    id: string;
    nombre: string;
    tipo: string;
    descripcion?: string;
    orden: number;
    richText?: string;
    documentos?: AdmissionDocument[];
    formatosPermitidos?: string;
    tamanoMaximo?: number | null;
    permitirReemplazo?: boolean;
    textoConfirmacion?: string;
    etiquetaConfirmacion?: string;
    obligatorio?: boolean;
}

// #endregion

// #region Document

export interface AdmissionDocument {
    id: string;
    nombre: string;
    obligatorio: boolean;
    descripcion?: string;
    plantilla?: AdmissionDocumentTemplate;
    formatosPermitidos?: string;
    tamanoMaximo?: number | null;
    permitirReemplazo?: boolean;
}

export interface AdmissionDocumentTemplate {
    nombre: string;
    tipo: string;
    dataUrl: string;
}

// #endregion

// #region Permissions

export interface StageGuardianPermissions {
    canEditApplicant: boolean;
    canEditOwnData: boolean;
    canAddGuardians: boolean;
    canManageGuardians: boolean;
    canEditDocuments: boolean;
}

// #endregion

// #region Catalogs

export interface CatalogItem {
    codigo: string;
    nombre: string;
}

// #endregion

// #region Content

export type AdmissionContentItem =
    | AdmissionActivity
    | AdmissionSection;

// #endregion
