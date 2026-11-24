import type { ColumnOptions, HeinrichColumn } from '@/components/heinrich/heinrich-data-table/data-table.types';
import type { ApplicantApplicationListItem } from './applicant-applications.types';
export const APPLICANT_APPLICATION_TABLE_DEFAULTS: ColumnOptions = { sortable: true };
export const APPLICANT_APPLICATION_COLUMNS: HeinrichColumn<ApplicantApplicationListItem>[] = [
    { title: 'Postulante', key: 'postulante', bold: true, wrap: true, width: '220px' },
    { title: 'Convocatoria', key: 'convocatoria' },
    { title: 'Nivel / grado', key: 'grado' },
    { title: 'Tutor responsable', key: 'tutor', wrap: true, width: '220px' },
    { title: 'Etapa actual', key: 'etapa' },
    { title: 'Fecha de registro', key: 'fecha', format: 'date', sortType: 'date' },
    { title: 'Acciones', key: 'id', align: 'center', sortable: false, width: '76px' }
];
