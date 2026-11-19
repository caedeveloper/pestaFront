export type EntidadId = 'postulante' | 'tutor-principal' | 'tutor-segundo';
export type TutorEntidadId = Exclude<EntidadId, 'postulante'>;

export interface Opcion {
    id: number;
    descripcion: string;
}

export interface OpcionTexto {
    id: string;
    descripcion: string;
}

export interface SeccionEstado {
    id: string;
    titulo: string;
    completa: boolean;
    opcional: boolean;
}

export interface HijoRegistro {
    id: number;
    nombre: string;
    fechaNacimiento: string;
    sexo: string | null;
    actividad: string;
    institucion: string;
    actualCompromiso: boolean;
}

export interface ReferenciaRegistro {
    id: number;
    nombre: string;
    relacion: string;
    telefono: string;
}

export interface PostulanteRegistro {
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    fechaNacimiento: string;
    sexo: string | null;
    religionId: number | null;
    tipoDocumentoIdentidadId: number | null;
    documentoIdentidad: string;
    paisNacimientoId: number | null;
    paisNacionalidadId: number | null;
    paisNacionalidad2Id: number | null;
    situacionPadresId: string | null;
    tipoProcedencia: string | null;
    procedenciaAcademica: string;
    gradoMatriculaId: number | null;
    cicloEducativoMatriculaId: number | null;
    acercaDePadres: string | null;
    estudianteViveCon: string | null;
    estudianteViveConOtro: string;
    estudianteCustodia: string | null;
    estudianteCustodiaOtro: string;
    situacionFamiliarDetalle: string;
    idiomaCasaId: number | null;
    segundoIdiomaCasaId: number | null;
    referencias: ReferenciaRegistro[];
}

export interface TutorRegistro {
    relacionTutorId: number | null;
    tieneCustodiaLegal: boolean | null;
    viveConPostulante: boolean | null;
    responsablePago: boolean | null;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    paisNacimientoId: number | null;
    paisNacionalidadId: number | null;
    paisNacionalidad2Id: number | null;
    idiomaMaternoId: number | null;
    idiomaSegundoId: number | null;
    fechaNacimiento: string;
    estadoCivilId: number | null;
    sexo: string | null;
    tipoDocumentoIdentidadId: number | null;
    documentoIdentidad: string;
    religionId: number | null;
    correoElectronico: string;
    correoConfirmacion: string;
    correoElectronico2: string;
    telefonoCelular: string;
    telefonoCelular2: string;
    domicilioPaisId: number | null;
    dentroDeLima: boolean | null;
    domicilioTelefono: string;
    domicilioTelefono2: string;
    domicilioDireccion: string;
    domicilioDistrito: string;
    domicilioCiudad: string;
    tipoVia: string | null;
    nombreVia: string;
    numero: string;
    tipoZona: string | null;
    nombreZona: string;
    interior: string;
    distritoId: number | null;
    gradoInstruccionId: number | null;
    esExalumno: boolean | null;
    anioEgreso: string;
    institucionPrimaria: string;
    institucionSecundaria: string;
    institucionSuperior: string;
    tituloProfesional: string;
    institucionPostGrado: string;
    tituloPostGrado: string;
    noLabora: boolean;
    cargo: string;
    empresa: string;
    trabajoPaisId: number | null;
    trabajoDentroDeLima: boolean | null;
    trabajoTelefono: string;
    trabajoAnexo: string;
    trabajoFax: string;
    trabajoDireccion: string;
    trabajoDistrito: string;
    trabajoCiudad: string;
    trabajoTipoVia: string | null;
    trabajoNombreVia: string;
    trabajoNumero: string;
    trabajoTipoZona: string | null;
    trabajoNombreZona: string;
    trabajoInterior: string;
    trabajoDistritoId: number | null;
    hijos: HijoRegistro[];
    esTitular: boolean;
    aceptaNormas: boolean;
    aceptaReglamentos: boolean;
    aceptaPolitica: boolean;
    aceptaPerfil: boolean;
}

export interface RegistroPostulante {
    postulanteId: number;
    tutorPrincipalId: number;
    tutorSegundoId: number;
    postulante: PostulanteRegistro;
    tutorPrincipal: TutorRegistro;
    tutorSegundo: TutorRegistro;
}

export interface RegistroPostulantesSnapshot {
    version: 3;
    registros: RegistroPostulante[];
    siguienteId: number;
}
