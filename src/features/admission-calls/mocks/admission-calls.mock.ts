import type {
    AdmissionCall,
    AdmissionStage,
    BuscarAdmissionCallsRequest,
    BuscarAdmissionCallsPaginadoRequest,
    CatalogItem,
    StageGuardianPermissions,
    BuscarAdmissionCallsResponse
} from '../admission-calls.types';

import { admissionCallsStore } from './admission-calls.store';

// #region Catalogs

const statuses: string[] = [
    'Borrador',
    'Programada',
    'Abierta',
    'Cerrada',
    'Finalizada'
];

const academicYears: string[] = [
    '2026',
    '2027',
    '2028',
    '2029'
];

const levels: string[] = [
    'Inicial',
    'Primaria',
    'Secundaria'
];

const grades: Record<string, string[]> = {
    Inicial: [
        'Inicial 3 años',
        'Inicial 4 años',
        'Kindergarten'
    ],
    Primaria: [
        '1.º Primaria',
        '2.º Primaria',
        '3.º Primaria',
        '4.º Primaria',
        '5.º Primaria',
        '6.º Primaria'
    ],
    Secundaria: [
        '1.º Secundaria',
        '2.º Secundaria',
        '3.º Secundaria',
        '4.º Secundaria',
        '5.º Secundaria'
    ]
};

// #endregion

// #region Business rules

function resolverAdmissionCallStatus(
    item: AdmissionCall
): string {

    if (item.finalizada) {
        return 'Finalizada';
    }

    if (!item.publicada) {
        return 'Borrador';
    }

    const now = new Date();

    if (now < new Date(item.apertura)) {
        return 'Programada';
    }

    if (now > new Date(item.cierre)) {
        return 'Cerrada';
    }

    return 'Abierta';
}

function actualizarAdmissionCallStatus(
    item: AdmissionCall
): AdmissionCall {

    return {
        ...item,
        estado: resolverAdmissionCallStatus(item)
    };
}

function estaDisponibleStage(
    stage: AdmissionStage
): boolean {

    const now = new Date();

    const validStart =
        !stage.fechaInicio ||
        new Date(stage.fechaInicio) <= now;

    const validEnd =
        !stage.fechaCierre ||
        new Date(stage.fechaCierre) >= now;

    return validStart && validEnd;
}

function obtenerDisabledGuardianPermissions():
    StageGuardianPermissions {

    return {
        canEditApplicant: false,
        canEditOwnData: false,
        canAddGuardians: false,
        canManageGuardians: false,
        canEditDocuments: false
    };
}

function convertirCatalogItems(
    values: string[]
): CatalogItem[] {

    return values.map(value => ({
        codigo: value,
        nombre: value
    }));
}

// #endregion

// #region Admission calls operations

export const admissionCallsMock = {

    buscarAdmissionCalls(
    request: BuscarAdmissionCallsPaginadoRequest
): BuscarAdmissionCallsResponse {

    const {
        pagination,
        nombre,
        anio,
        grado,
        estado
    } = request;

    const {
        page,
        itemsPerPage,
        sort
    } = pagination;

    // Validar paginación

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(itemsPerPage) ||
        itemsPerPage < 1 ||
        itemsPerPage > 100
    ) {
        throw new Error('Paginación inválida.');
    }

    // Obtener registros y resolver estado actual

    let items = admissionCallsStore.list().map(item => ({
        ...item,
        estado: resolverAdmissionCallStatus(item)
    }));

    // Aplicar filtros

    if (nombre?.trim()) {
        const query = nombre.trim().toLowerCase();

        items = items.filter(item =>
            item.nombre.toLowerCase().includes(query) ||
            (item.descripcion ?? '').toLowerCase().includes(query)
        );
    }

    if (anio) {
        items = items.filter(item => item.anio === anio);
    }

    if (grado) {
        items = items.filter(item => item.grado === grado);
    }

    if (estado) {
        items = items.filter(item => item.estado === estado);
    }

    // Obtener total después de aplicar filtros

    const totalItems = items.length;

    // Ordenamiento

    const collator = new Intl.Collator('es-PE', {
        numeric: true,
        sensitivity: 'base'
    });

    function normalizarFecha(value: string): string {
        const match = value.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );

        return match
            ? `${match[3]}-${match[2]}-${match[1]}`
            : value;
    }

    function obtenerValor(item: AdmissionCall): string | number {
        switch (sort?.key) {
            case 'nombre':
                return item.nombre;

            case 'anio':
                return Number(item.anio);

            case 'grado':
                return item.grado;

            case 'apertura':
                return normalizarFecha(item.apertura);

            case 'cierre':
                return normalizarFecha(item.cierre);

            case 'postulantes':
                return item.postulantes;

            case 'estado':
                return item.estado;

            default:
                return item.id;
        }
    }

    items.sort((a, b) => {

        const first = obtenerValor(a);
        const second = obtenerValor(b);

        const comparison =
            typeof first === 'number' &&
            typeof second === 'number'
                ? first - second
                : collator.compare(
                    String(first),
                    String(second)
                );

        const result = sort?.direction === 'desc'
            ? -comparison
            : comparison;

        return result || collator.compare(a.id, b.id);
    });

    // Aplicar paginación

    const start = (page - 1) * itemsPerPage;

    return {
        items: items.slice(start, start + itemsPerPage),
        totalItems
    };
},
    obtenerAdmissionCall(
        id: string
    ): AdmissionCall | undefined {

        const item = admissionCallsStore.get(id);

        if (!item) {
            return undefined;
        }

        return actualizarAdmissionCallStatus(item);
    },

    guardarAdmissionCall(
        item: AdmissionCall
    ): AdmissionCall {

        const value: AdmissionCall = {
            ...item,
            id: item.id || crypto.randomUUID(),
            nombre: item.nombre.trim(),
            estado: resolverAdmissionCallStatus(item)
        };

        return admissionCallsStore.set(value);
    },

    generarAdmissionCallId(): string {

        return crypto.randomUUID();
    },

    obtenerStages(
        admissionCallId: string
    ): AdmissionStage[] {

        const item = admissionCallsStore.get(
            admissionCallId
        );

        return item?.etapas ?? [];
    },

    obtenerStageGuardianPermissions(
        admissionCallId: string,
        stageId: string
    ): StageGuardianPermissions {

        const admissionCall =
            admissionCallsStore.get(admissionCallId);

        const stage = admissionCall?.etapas.find(
            item => item.id === stageId
        );

        if (!stage || !estaDisponibleStage(stage)) {
            return obtenerDisabledGuardianPermissions();
        }

        return { ...stage.guardianPermissions };
    },

    obtenerStatuses(): CatalogItem[] {

        return convertirCatalogItems(statuses);
    },

    obtenerAcademicYears(): CatalogItem[] {

        return convertirCatalogItems(academicYears);
    },

    obtenerLevels(): CatalogItem[] {

        return convertirCatalogItems(levels);
    },

    obtenerGrades(level?: string): CatalogItem[] {

        const values = level
            ? grades[level] ?? []
            : Object.values(grades).flat();

        return convertirCatalogItems(values);
    }
};

// #endregion