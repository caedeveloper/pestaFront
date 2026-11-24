import type {
    AdmissionCall
} from '../admission-calls.types';

export const admissionCallsSeed: AdmissionCall[] = [
    {
        id: '1',
        nombre: 'Kindergarten 2027',
        descripcion: 'Proceso de admisión inicial',
        anio: '2027',
        nivel: 'Inicial',
        grado: 'Kindergarten',
        tipoAlcance: 'grado',
        apertura: '2026-06-01T08:00',
        cierre: '2026-09-30T18:00',
        registros: 80,
        cupos: 100,
        postulantes: 120,
        duracionReservaMinutos: 30,
        publicada: true,
        finalizada: false,
        estado: 'Abierta',
        etapas: [
            {
                id: 'stage-1',
                admissionCallId: '1',
                nombre: 'Documentación',
                descripcion:
                    'Adjunta los documentos requeridos para continuar con el proceso de admisión.',
                orden: 1,
                fechaInicio: '',
                fechaCierre: '',
                fechaPublicacion: '',
                connectionIds: ['stage-2'],
                guardianPermissions: {
                    canEditApplicant: false,
                    canEditOwnData: false,
                    canAddGuardians: false,
                    canManageGuardians: false,
                    canEditDocuments: true
                },
                contenido: [
                    {
                        id: 'welcome',
                        tipo: 'richText',
                        nombre: 'Bienvenida',
                        orden: 1,
                        richText:
                            '<h2>Bienvenidos</h2><p>Adjunta los documentos solicitados y confirma que la información es correcta.</p>'
                    },
                    {
                        id: 'family-docs',
                        tipo: 'section',
                        nombre: 'Documentos familiares',
                        descripcion:
                            'Información requerida para el expediente.',
                        orden: 2,
                        contenido: [
                            {
                                id: 'upload-docs',
                                tipo: 'documentUpload',
                                nombre: 'Documentos requeridos',
                                descripcion:
                                    'Formatos permitidos: PDF, JPG o PNG.',
                                orden: 1,
                                formatosPermitidos: 'PDF, JPG, PNG',
                                tamanoMaximo: 5,
                                permitirReemplazo: true,
                                documentos: [
                                    {
                                        id: 'dni',
                                        nombre: 'Documento de identidad',
                                        obligatorio: true,
                                        descripcion:
                                            'Copia legible por ambos lados.'
                                    },
                                    {
                                        id: 'birth',
                                        nombre: 'Partida de nacimiento',
                                        obligatorio: true
                                    }
                                ]
                            },
                            {
                                id: 'confirm-data',
                                tipo: 'confirmation',
                                nombre: 'Confirmación',
                                orden: 2,
                                textoConfirmacion:
                                    'Declaro que la información y documentos proporcionados son correctos.',
                                etiquetaConfirmacion:
                                    'Confirmo la información declarada',
                                obligatorio: true
                            }
                        ]
                    }
                ]
            },
            {
                id: 'stage-2',
                admissionCallId: '1',
                nombre: 'Evaluación y entrevista',
                descripcion:
                    'Información sobre la siguiente etapa del proceso.',
                orden: 2,
                fechaInicio: '',
                fechaCierre: '',
                fechaPublicacion: '',
                connectionIds: ['stage-3'],
                guardianPermissions: {
                    canEditApplicant: false,
                    canEditOwnData: false,
                    canAddGuardians: false,
                    canManageGuardians: false,
                    canEditDocuments: false
                },
                contenido: [
                    {
                        id: 'interview-info',
                        tipo: 'richText',
                        nombre: 'Indicaciones de entrevista',
                        orden: 1,
                        richText:
                            '<h2>Entrevista</h2><p>El colegio se comunicará contigo para coordinar la entrevista.</p>'
                    }
                ]
            },
            {
                id: 'stage-3',
                admissionCallId: '1',
                nombre: 'Evaluación final',
                descripcion: 'Comunicación final del proceso.',
                orden: 3,
                fechaInicio: '',
                fechaCierre: '',
                fechaPublicacion: '',
                connectionIds: [],
                guardianPermissions: {
                    canEditApplicant: false,
                    canEditOwnData: false,
                    canAddGuardians: false,
                    canManageGuardians: false,
                    canEditDocuments: false
                },
                contenido: [
                    {
                        id: 'final-info',
                        tipo: 'richText',
                        nombre: 'Mensaje final',
                        orden: 1,
                        richText:
                            '<h2>Gracias por participar</h2><p>Revisa esta sección para conocer las comunicaciones del proceso.</p>'
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        nombre: 'Primaria 2027',
        descripcion: 'Primer grado de primaria',
        anio: '2027',
        nivel: 'Primaria',
        grado: '1.º Primaria',
        tipoAlcance: 'grado',
        apertura: '2026-08-15T08:00',
        cierre: '2026-11-15T18:00',
        registros: 0,
        cupos: 50,
        postulantes: 0,
        duracionReservaMinutos: 30,
        publicada: false,
        finalizada: false,
        estado: 'Borrador',
        etapas: []
    },
    {
        id: '3',
        nombre: 'Kindergarten 2026',
        anio: '2026',
        nivel: 'Inicial',
        grado: 'Kindergarten',
        tipoAlcance: 'grado',
        apertura: '2025-06-01T08:00',
        cierre: '2025-09-30T18:00',
        registros: 100,
        cupos: 100,
        postulantes: 145,
        duracionReservaMinutos: 30,
        publicada: true,
        finalizada: false,
        estado: 'Cerrada',
        etapas: []
    },
    {
        id: '4',
        nombre: 'Secundaria 2027',
        descripcion: 'Primer grado de secundaria',
        anio: '2027',
        nivel: 'Secundaria',
        grado: '1.º Secundaria',
        tipoAlcance: 'grado',
        apertura: '2026-10-01T08:00',
        cierre: '2026-12-15T18:00',
        registros: 12,
        cupos: 60,
        postulantes: 18,
        duracionReservaMinutos: 30,
        publicada: true,
        finalizada: false,
        estado: 'Programada',
        etapas: []
    },
    {
        id: '5',
        nombre: 'Primaria 2026',
        anio: '2026',
        nivel: 'Primaria',
        grado: '2.º Primaria',
        tipoAlcance: 'grado',
        apertura: '2025-03-01T08:00',
        cierre: '2025-04-30T18:00',
        registros: 50,
        cupos: 50,
        postulantes: 64,
        duracionReservaMinutos: 30,
        publicada: true,
        finalizada: true,
        estado: 'Finalizada',
        etapas: []
    }
];