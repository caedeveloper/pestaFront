export type ConvocatoriaEstado = 'Borrador' | 'Programada' | 'Abierta' | 'Cerrada' | 'Finalizada';
export type Convocatoria = { id: number; nombre: string; descripcion?: string; anio: string; grado: string; apertura: string; cierre: string; registros: number; cupos: number; postulantes: number; estado: ConvocatoriaEstado };

export const convocatoriasMock: Convocatoria[] = [
    { id: 1, nombre: 'Kindergarten 2027', descripcion: 'Proceso de admisión inicial', anio: '2027', grado: 'Kindergarten', apertura: '01/06/2026', cierre: '30/09/2026', registros: 80, cupos: 100, postulantes: 120, estado: 'Abierta' },
    { id: 2, nombre: 'Primaria 2027', descripcion: 'Primer grado de primaria', anio: '2027', grado: '1.º Primaria', apertura: '15/08/2026', cierre: '15/11/2026', registros: 0, cupos: 50, postulantes: 0, estado: 'Borrador' },
    { id: 3, nombre: 'Kindergarten 2026', anio: '2026', grado: 'Kindergarten', apertura: '01/06/2025', cierre: '30/09/2025', registros: 100, cupos: 100, postulantes: 145, estado: 'Cerrada' },
    { id: 4, nombre: 'Secundaria 2027', descripcion: 'Primer grado de secundaria', anio: '2027', grado: '1.º Secundaria', apertura: '01/10/2026', cierre: '15/12/2026', registros: 12, cupos: 60, postulantes: 18, estado: 'Programada' },
    { id: 5, nombre: 'Primaria 2026', anio: '2026', grado: '2.º Primaria', apertura: '01/03/2025', cierre: '30/04/2025', registros: 50, cupos: 50, postulantes: 64, estado: 'Finalizada' }
];
