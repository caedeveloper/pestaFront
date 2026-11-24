import type {
    HeinrichColumn,
    ColumnOptions
} from '@/components/heinrich/heinrich-data-table/data-table.types';

import type {
    AdmissionCall
} from './admission-calls.types';

// #region Activity types

export const ACTIVITY_TYPES = {
    RICH_TEXT: 'richText',
    DOCUMENT_UPLOAD: 'documentUpload',
    CONFIRMATION: 'confirmation'
} as const;

// #endregion

// #region Scope types

export const SCOPE_TYPES = {
    LEVEL: 'nivel',
    GRADE: 'grado'
} as const;

// #endregion

// #region Content types

export const CONTENT_TYPES = {
    SECTION: 'section'
} as const;

// #endregion

// #region DataTable

export const ADMISSION_CALL_TABLE_DEFAULTS: ColumnOptions = {
    sortable: true
};

export const ADMISSION_CALL_COLUMNS: HeinrichColumn<AdmissionCall>[] = [
    {
        key: 'nombre',
        title: 'Convocatoria',
        bold: true,
        width: '25%',
        sub: {
            key: 'descripcion'
        }
    },
    {
        key: 'anio',
        title: 'Año académico',
        sortType: 'number'
    },
    {
        key: 'grado',
        title: 'Nivel / grado'
    },
    {
        key: 'apertura',
        title: 'Fecha de apertura',
        format: 'date',
        sortType: 'date'
    },
    {
        key: 'cierre',
        title: 'Fecha de cierre',
        format: 'date',
        sortType: 'date'
    },
    {
        key: 'cupos',
        title: 'Cupos',
        align: 'center',
        sortable: false,
        formatter: item => `${item.registros} / ${item.cupos}`
    },
    {
        key: 'postulantes',
        title: 'Inscritos',
        align: 'center',
        sortType: 'number'
    },
    {
        key: 'estado',
        title: 'Estado',
        align: 'center'
    },
    {
        key: 'id',
        title: 'Acciones',
        align: 'center',
        sortable: false,
        width: '76px'
    }
];


export const ADMISSION_CALL_INITIAL_VALUES = {
    nombre: '',
    descripcion: '',
    anio: '',
    nivel: '',
    grado: '',
    tipoAlcance: SCOPE_TYPES.LEVEL,
    apertura: '',
    cierre: '',
    registros: 0,
    cupos: 0,
    postulantes: 0,
    duracionReservaMinutos: 30,
    publicada: false,
    finalizada: false,
    estado: 'Borrador'
} satisfies Omit<AdmissionCall, 'id' | 'etapas'>;
// #endregion

export const ACTIVITY_OPTIONS = [
    {
        value: ACTIVITY_TYPES.RICH_TEXT,
        title: 'Texto enriquecido',
        icon: 'mdi-text-box-outline'
    },
    {
        value: ACTIVITY_TYPES.DOCUMENT_UPLOAD,
        title: 'Carga de documentos',
        icon: 'mdi-file-upload-outline'
    },
    {
        value: ACTIVITY_TYPES.CONFIRMATION,
        title: 'Confirmación',
        icon: 'mdi-check-decagram-outline'
    }
];