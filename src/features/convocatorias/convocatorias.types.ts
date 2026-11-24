export interface Convocatoria {
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
    etapas: AdmissionStage[];
}

export interface ConvocatoriaFiltros {
    nombre?: string;
    anio?: string;
    grado?: string;
    estado?: string;
}

export interface AdmissionStage {
    id: string;
    convocatoriaId: string;
    nombre: string;
    descripcion: string;
    orden: number;
    fechaInicio: string;
    fechaCierre: string;
    fechaPublicacion: string;
    workflowIds?: string[];
    contenido?: AdmissionContentItem[];
    secciones?: AdmissionSection[];
    connectionIds?: string[];
    tutorPermissions?: StageTutorPermissions;
}

export interface AdmissionSection {
    id: string;
    nombre: string;
    descripcion?: string;
    orden: number;
    tipo: 'section';
    contenido: AdmissionContentItem[];
}

export interface AdmissionAction {
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

export interface StageTutorPermissions {
    canEditApplicant: boolean;
    canEditOwnData: boolean;
    canAddTutors: boolean;
    canManageTutors: boolean;
    canEditDocuments: boolean;
}

export interface CatalogoItem {
    codigo: string;
    nombre: string;
}

export type AdmissionContentItem =
    | AdmissionAction
    | AdmissionSection;