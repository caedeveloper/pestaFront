export type ConvocatoriaEstado = 'Borrador' | 'Programada' | 'Abierta' | 'Cerrada' | 'Finalizada';
export type TipoAlcance = 'nivel' | 'grado';

export type Convocatoria = {
    id: string;
    nombre: string;
    descripcion?: string;
    anio: string;
    nivel: string;
    grado: string;
    tipoAlcance: TipoAlcance;
    apertura: string;
    cierre: string;
    registros: number;
    cupos: number;
    postulantes: number;
    duracionReservaMinutos: number;
    publicada: boolean;
    finalizada: boolean;
    estado: ConvocatoriaEstado;
};

export const convocatoriasMock: Convocatoria[] = [
    { id: '1', nombre: 'Kindergarten 2027', descripcion: 'Proceso de admisión inicial', anio: '2027', nivel: 'Inicial', grado: 'Kindergarten', tipoAlcance: 'grado', apertura: '2026-06-01T08:00', cierre: '2026-09-30T18:00', registros: 80, cupos: 100, postulantes: 120, duracionReservaMinutos: 30, publicada: true, finalizada: false, estado: 'Abierta' },
    { id: '2', nombre: 'Primaria 2027', descripcion: 'Primer grado de primaria', anio: '2027', nivel: 'Primaria', grado: '1.º Primaria', tipoAlcance: 'grado', apertura: '2026-08-15T08:00', cierre: '2026-11-15T18:00', registros: 0, cupos: 50, postulantes: 0, duracionReservaMinutos: 30, publicada: false, finalizada: false, estado: 'Borrador' },
    { id: '3', nombre: 'Kindergarten 2026', anio: '2026', nivel: 'Inicial', grado: 'Kindergarten', tipoAlcance: 'grado', apertura: '2025-06-01T08:00', cierre: '2025-09-30T18:00', registros: 100, cupos: 100, postulantes: 145, duracionReservaMinutos: 30, publicada: true, finalizada: false, estado: 'Cerrada' },
    { id: '4', nombre: 'Secundaria 2027', descripcion: 'Primer grado de secundaria', anio: '2027', nivel: 'Secundaria', grado: '1.º Secundaria', tipoAlcance: 'grado', apertura: '2026-10-01T08:00', cierre: '2026-12-15T18:00', registros: 12, cupos: 60, postulantes: 18, duracionReservaMinutos: 30, publicada: true, finalizada: false, estado: 'Programada' },
    { id: '5', nombre: 'Primaria 2026', anio: '2026', nivel: 'Primaria', grado: '2.º Primaria', tipoAlcance: 'grado', apertura: '2025-03-01T08:00', cierre: '2025-04-30T18:00', registros: 50, cupos: 50, postulantes: 64, duracionReservaMinutos: 30, publicada: true, finalizada: true, estado: 'Finalizada' }
];
