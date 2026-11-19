import type { Opcion, PostulanteRegistro, ReferenciaRegistro, RegistroPostulante, SeccionEstado, TutorRegistro } from './postulantes.types';

export function tieneValor(valor: unknown): boolean {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    if (typeof valor === 'boolean') return true;
    return true;
}

export function nombreCompleto(persona: { nombres: string; apellidoPaterno: string; apellidoMaterno: string }): string {
    const nombre = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter((parte) => parte.trim()).join(' ');
    return nombre || 'Sin nombre';
}

export function iniciales(persona: { nombres: string; apellidoPaterno: string }): string {
    const letras = `${persona.nombres.trim().charAt(0)}${persona.apellidoPaterno.trim().charAt(0)}`.toUpperCase();
    return letras || '—';
}

export function referenciaVacia(id = 1): ReferenciaRegistro {
    return { id, nombre: '', relacion: '', telefono: '' };
}

export function asegurarReferencias(postulante: PostulanteRegistro) {
    if (Array.isArray(postulante.referencias) && postulante.referencias.length) return;
    const previo = postulante as PostulanteRegistro & {
        referencia1Nombre?: string;
        referencia1Relacion?: string;
        referencia1Telefono?: string;
        referencia2Nombre?: string;
        referencia2Relacion?: string;
        referencia2Telefono?: string;
    };
    const candidatas = [
        { id: 1, nombre: previo.referencia1Nombre ?? '', relacion: previo.referencia1Relacion ?? '', telefono: previo.referencia1Telefono ?? '' },
        { id: 2, nombre: previo.referencia2Nombre ?? '', relacion: previo.referencia2Relacion ?? '', telefono: previo.referencia2Telefono ?? '' }
    ].filter((item, indice) => indice === 0 || item.nombre || item.relacion || item.telefono);
    postulante.referencias = candidatas.length ? candidatas : [referenciaVacia()];
}

export function etiqueta(opciones: Opcion[], id: number | null): string {
    return opciones.find((opcion) => opcion.id === id)?.descripcion ?? '';
}

export function registroAsignadoA(registro: RegistroPostulante, tutorId: number | null, correo: string): boolean {
    if (tutorId && (registro.tutorPrincipalId === tutorId || registro.tutorSegundoId === tutorId)) return true;
    const email = correo.trim().toLocaleLowerCase();
    if (!email) return false;
    return [registro.tutorPrincipal, registro.tutorSegundo].some((tutor) => tutor.correoElectronico.trim().toLocaleLowerCase() === email);
}

export function porcentaje(secciones: SeccionEstado[]): number {
    const obligatorias = secciones.filter((seccion) => !seccion.opcional);
    if (!obligatorias.length) return 0;
    return Math.round((obligatorias.filter((seccion) => seccion.completa).length / obligatorias.length) * 100);
}

function domicilioCompleto(dentroDeLima: boolean | null, simple: string[], complejo: unknown[]): boolean {
    if (dentroDeLima === null) return false;
    return (dentroDeLima ? complejo : simple).every(tieneValor);
}

export function seccionesPostulante(postulante: PostulanteRegistro): SeccionEstado[] {
    const generales = [
        postulante.apellidoPaterno,
        postulante.apellidoMaterno,
        postulante.nombres,
        postulante.fechaNacimiento,
        postulante.sexo,
        postulante.tipoDocumentoIdentidadId,
        postulante.documentoIdentidad,
        postulante.paisNacimientoId,
        postulante.paisNacionalidadId,
        postulante.situacionPadresId
    ].every(tieneValor);
    const adicionales = [postulante.tipoProcedencia, postulante.procedenciaAcademica, postulante.gradoMatriculaId, postulante.cicloEducativoMatriculaId].every(tieneValor);
    const familiar = [postulante.acercaDePadres, postulante.estudianteViveCon, postulante.estudianteCustodia, postulante.situacionFamiliarDetalle].some(tieneValor);
    const idiomasCompletos = tieneValor(postulante.idiomaCasaId);
    const primera = postulante.referencias?.[0];
    const referencias = Boolean(primera) && [primera.nombre, primera.relacion, primera.telefono].every(tieneValor);
    return [
        { id: 'generales', titulo: '1. Datos generales del postulante', completa: generales, opcional: false },
        { id: 'adicionales', titulo: '2. Datos adicionales', completa: adicionales, opcional: false },
        { id: 'familiar', titulo: '3. Situación familiar', completa: familiar, opcional: true },
        { id: 'idiomas', titulo: '4. Idiomas', completa: idiomasCompletos, opcional: false },
        { id: 'referencias', titulo: '5. Referencias', completa: referencias, opcional: false }
    ];
}

export function seccionesTutor(tutor: TutorRegistro): SeccionEstado[] {
    const relacion = [tutor.relacionTutorId, tutor.tieneCustodiaLegal, tutor.viveConPostulante, tutor.responsablePago].every(tieneValor);
    const personales = [
        tutor.apellidoPaterno,
        tutor.apellidoMaterno,
        tutor.nombres,
        tutor.paisNacimientoId,
        tutor.paisNacionalidadId,
        tutor.idiomaMaternoId,
        tutor.fechaNacimiento,
        tutor.estadoCivilId,
        tutor.sexo,
        tutor.tipoDocumentoIdentidadId,
        tutor.documentoIdentidad
    ].every(tieneValor);
    const contacto = tieneValor(tutor.correoElectronico) && tutor.correoElectronico === tutor.correoConfirmacion && tieneValor(tutor.telefonoCelular);
    const domicilio = tieneValor(tutor.domicilioPaisId) && tieneValor(tutor.domicilioTelefono) && domicilioCompleto(
        tutor.dentroDeLima,
        [tutor.domicilioDireccion, tutor.domicilioCiudad],
        [tutor.tipoVia, tutor.nombreVia, tutor.numero, tutor.distritoId, tutor.domicilioCiudad]
    );
    const educacion = tieneValor(tutor.gradoInstruccionId) || tieneValor(tutor.institucionPrimaria);
    const laboral = tutor.noLabora || (
        tieneValor(tutor.cargo) && tieneValor(tutor.empresa) && tieneValor(tutor.trabajoPaisId) && tieneValor(tutor.trabajoTelefono) && domicilioCompleto(
            tutor.trabajoDentroDeLima,
            [tutor.trabajoDireccion, tutor.trabajoCiudad],
            [tutor.trabajoTipoVia, tutor.trabajoNombreVia, tutor.trabajoNumero, tutor.trabajoDistritoId, tutor.trabajoCiudad]
        )
    );
    const hijos = tutor.hijos.some((hijo) => hijo.actualCompromiso && tieneValor(hijo.nombre) && tieneValor(hijo.fechaNacimiento));
    const reglamentos = tutor.esTitular
        ? tutor.aceptaNormas && tutor.aceptaReglamentos && tutor.aceptaPolitica && tutor.aceptaPerfil
        : tutor.aceptaPolitica;
    return [
        { id: 'relacion', titulo: 'Relación familiar', completa: relacion, opcional: false },
        { id: 'personales', titulo: '1. Datos personales', completa: personales, opcional: false },
        { id: 'contacto', titulo: '2. Datos de contacto', completa: contacto, opcional: false },
        { id: 'domicilio', titulo: '3. Datos del domicilio', completa: domicilio, opcional: false },
        { id: 'educacion', titulo: '4. Datos de educación', completa: educacion, opcional: true },
        { id: 'laboral', titulo: '5. Datos del centro laboral', completa: laboral, opcional: false },
        { id: 'hijos', titulo: '6. Hijos', completa: hijos, opcional: false },
        { id: 'reglamentos', titulo: '7. Reglamentos y políticas', completa: reglamentos, opcional: false }
    ];
}
