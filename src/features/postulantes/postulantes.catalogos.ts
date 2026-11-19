import type { Opcion, OpcionTexto } from './postulantes.types';

export const PAIS_PERU = 1;

export const paises: Opcion[] = [
    { id: 1, descripcion: 'Perú' },
    { id: 2, descripcion: 'Suiza' },
    { id: 3, descripcion: 'Alemania' },
    { id: 4, descripcion: 'España' }
];

export const idiomas: Opcion[] = [
    { id: 1, descripcion: 'Español' },
    { id: 2, descripcion: 'Alemán' },
    { id: 3, descripcion: 'Inglés' },
    { id: 4, descripcion: 'Francés' }
];

export const estadosCiviles: Opcion[] = [
    { id: 1, descripcion: 'Soltero(a)' },
    { id: 2, descripcion: 'Casado(a)' },
    { id: 3, descripcion: 'Divorciado(a)' },
    { id: 4, descripcion: 'Viudo(a)' },
    { id: 5, descripcion: 'Conviviente' }
];

export const tiposDocumento: Opcion[] = [
    { id: 2, descripcion: 'DNI' },
    { id: 3, descripcion: 'Carné de extranjería' },
    { id: 4, descripcion: 'Pasaporte' }
];

export const religiones: Opcion[] = [
    { id: 1, descripcion: 'Católica' },
    { id: 2, descripcion: 'Evangélica' },
    { id: 3, descripcion: 'Judía' },
    { id: 4, descripcion: 'Ninguna' }
];

export const relacionesTutor: Opcion[] = [
    { id: 1, descripcion: 'Madre' },
    { id: 2, descripcion: 'Padre' },
    { id: 3, descripcion: 'Apoderado' }
];

export const situacionesPadres: OpcionTexto[] = [
    { id: 'CAS', descripcion: 'Casados' },
    { id: 'CON', descripcion: 'Convivientes' },
    { id: 'SEP', descripcion: 'Separados' },
    { id: 'DIV', descripcion: 'Divorciados' }
];

export const acercaDePadres: OpcionTexto[] = [
    { id: 'VJ', descripcion: 'Viven juntos' },
    { id: 'VS', descripcion: 'Viven separados' },
    { id: 'PS', descripcion: 'Padre soltero' },
    { id: 'MS', descripcion: 'Madre soltera' }
];

export const viveConOpciones: OpcionTexto[] = [
    { id: 'AP', descripcion: 'Ambos padres' },
    { id: 'LM', descripcion: 'La madre' },
    { id: 'EP', descripcion: 'El padre' },
    { id: 'TC', descripcion: 'Tiempo compartido' },
    { id: 'OT', descripcion: 'Otro' }
];

export const custodiaOpciones: OpcionTexto[] = [
    { id: 'AP', descripcion: 'Ambos padres' },
    { id: 'LM', descripcion: 'La madre' },
    { id: 'EP', descripcion: 'El padre' },
    { id: 'AB', descripcion: 'Abuelos' },
    { id: 'TI', descripcion: 'Tíos' },
    { id: 'OT', descripcion: 'Otro' }
];

export const tiposProcedencia: OpcionTexto[] = [
    { id: 'Nido', descripcion: 'Nido' },
    { id: 'No asiste al nido', descripcion: 'No asiste al nido' },
    { id: 'Colegio', descripcion: 'Colegio' }
];

export const nidos = ['Nido Arcoíris', 'Nido Los Álamos', 'Nido San Jorge'];

export const grados: Opcion[] = [
    { id: 1, descripcion: 'Spielgruppe' },
    { id: 2, descripcion: 'Prekindergarten' },
    { id: 3, descripcion: 'Kindergarten' }
];

export const ciclos: Opcion[] = [
    { id: 2026, descripcion: '2026' },
    { id: 2027, descripcion: '2027' }
];

export const gradosInstruccion: Opcion[] = [
    { id: 1, descripcion: 'Primaria' },
    { id: 2, descripcion: 'Secundaria' },
    { id: 3, descripcion: 'Superior' },
    { id: 4, descripcion: 'Postgrado' }
];

export const tiposVia = [
    { value: 'Av.', title: 'Avenida' },
    { value: 'Jr.', title: 'Jirón' },
    { value: 'Ca.', title: 'Calle' },
    { value: 'Psj.', title: 'Pasaje' },
    { value: 'Alameda', title: 'Alameda' }
];

export const tiposZona = [
    { value: '', title: 'Ninguno' },
    { value: 'Urb.', title: 'Urbanización' },
    { value: 'Resid.', title: 'Residencial' },
    { value: 'A.A.H.H.', title: 'A.A.H.H.' }
];

export const distritosLima: Opcion[] = [
    { id: 1, descripcion: 'Miraflores' },
    { id: 2, descripcion: 'San Isidro' },
    { id: 3, descripcion: 'Santiago de Surco' },
    { id: 4, descripcion: 'San Borja' }
];

export const actividadesHijo = ['Ninguno', 'Nido', 'Colegio', 'Universidad', 'Trabajo', 'Otro'];

export const sexos = [
    { id: 'M', descripcion: 'Masculino' },
    { id: 'F', descripcion: 'Femenino' }
];
