import { PAIS_PERU } from './postulantes.catalogos';
import { referenciaVacia } from './postulantes.helpers';
import type { PostulanteRegistro, RegistroPostulante, RegistroPostulantesSnapshot, TutorRegistro } from './postulantes.types';

export function crearTutorVacio(esTitular: boolean): TutorRegistro {
    return {
        relacionTutorId: null,
        tieneCustodiaLegal: null,
        viveConPostulante: null,
        responsablePago: null,
        apellidoPaterno: '',
        apellidoMaterno: '',
        nombres: '',
        paisNacimientoId: null,
        paisNacionalidadId: null,
        paisNacionalidad2Id: null,
        idiomaMaternoId: null,
        idiomaSegundoId: null,
        fechaNacimiento: '',
        estadoCivilId: null,
        sexo: null,
        tipoDocumentoIdentidadId: null,
        documentoIdentidad: '',
        religionId: null,
        correoElectronico: '',
        correoConfirmacion: '',
        correoElectronico2: '',
        telefonoCelular: '',
        telefonoCelular2: '',
        domicilioPaisId: null,
        dentroDeLima: null,
        domicilioTelefono: '',
        domicilioTelefono2: '',
        domicilioDireccion: '',
        domicilioDistrito: '',
        domicilioCiudad: '',
        tipoVia: null,
        nombreVia: '',
        numero: '',
        tipoZona: null,
        nombreZona: '',
        interior: '',
        distritoId: null,
        gradoInstruccionId: null,
        esExalumno: null,
        anioEgreso: '',
        institucionPrimaria: '',
        institucionSecundaria: '',
        institucionSuperior: '',
        tituloProfesional: '',
        institucionPostGrado: '',
        tituloPostGrado: '',
        noLabora: false,
        cargo: '',
        empresa: '',
        trabajoPaisId: null,
        trabajoDentroDeLima: null,
        trabajoTelefono: '',
        trabajoAnexo: '',
        trabajoFax: '',
        trabajoDireccion: '',
        trabajoDistrito: '',
        trabajoCiudad: '',
        trabajoTipoVia: null,
        trabajoNombreVia: '',
        trabajoNumero: '',
        trabajoTipoZona: null,
        trabajoNombreZona: '',
        trabajoInterior: '',
        trabajoDistritoId: null,
        hijos: [],
        esTitular,
        aceptaNormas: false,
        aceptaReglamentos: false,
        aceptaPolitica: false,
        aceptaPerfil: false
    };
}

export function crearPostulante(): PostulanteRegistro {
    return {
        apellidoPaterno: 'Meier',
        apellidoMaterno: 'Hoffmann',
        nombres: 'Lucía Fernanda',
        fechaNacimiento: '2022-03-12',
        sexo: 'F',
        religionId: null,
        tipoDocumentoIdentidadId: 2,
        documentoIdentidad: '78451236',
        paisNacimientoId: PAIS_PERU,
        paisNacionalidadId: PAIS_PERU,
        paisNacionalidad2Id: null,
        situacionPadresId: 'CAS',
        tipoProcedencia: null,
        procedenciaAcademica: '',
        gradoMatriculaId: null,
        cicloEducativoMatriculaId: null,
        acercaDePadres: null,
        estudianteViveCon: null,
        estudianteViveConOtro: '',
        estudianteCustodia: null,
        estudianteCustodiaOtro: '',
        situacionFamiliarDetalle: '',
        idiomaCasaId: null,
        segundoIdiomaCasaId: null,
        referencias: [referenciaVacia()]
    };
}

export function crearPostulanteVacio(): PostulanteRegistro {
    return {
        apellidoPaterno: '', apellidoMaterno: '', nombres: '', fechaNacimiento: '', sexo: null,
        religionId: null, tipoDocumentoIdentidadId: null, documentoIdentidad: '', paisNacimientoId: null,
        paisNacionalidadId: null, paisNacionalidad2Id: null, situacionPadresId: null,
        tipoProcedencia: null, procedenciaAcademica: '', gradoMatriculaId: null,
        cicloEducativoMatriculaId: null, acercaDePadres: null, estudianteViveCon: null,
        estudianteViveConOtro: '', estudianteCustodia: null, estudianteCustodiaOtro: '',
        situacionFamiliarDetalle: '', idiomaCasaId: null, segundoIdiomaCasaId: null,
        referencias: [referenciaVacia()]
    };
}

export function crearTutorPrincipal(): TutorRegistro {
    return {
        ...crearTutorVacio(true),
        relacionTutorId: 1,
        tieneCustodiaLegal: true,
        viveConPostulante: true,
        responsablePago: true,
        apellidoPaterno: 'Hoffmann',
        apellidoMaterno: 'Weber',
        nombres: 'Ana Lucía',
        paisNacimientoId: PAIS_PERU,
        paisNacionalidadId: PAIS_PERU,
        paisNacionalidad2Id: 2,
        idiomaMaternoId: 1,
        idiomaSegundoId: 2,
        fechaNacimiento: '1984-06-02',
        estadoCivilId: 2,
        sexo: 'F',
        tipoDocumentoIdentidadId: 2,
        documentoIdentidad: '41223344',
        correoElectronico: 'ana.hoffmann@correo.com',
        correoConfirmacion: 'ana.hoffmann@correo.com',
        telefonoCelular: '999111222',
        domicilioPaisId: PAIS_PERU,
        dentroDeLima: true,
        domicilioTelefono: '014441234',
        tipoVia: 'Av.',
        nombreVia: 'Angamos Oeste',
        numero: '450',
        tipoZona: 'Urb.',
        nombreZona: 'Miraflores',
        interior: '302',
        distritoId: 1,
        domicilioCiudad: 'Lima'
    };
}

export function crearTutorSegundo(): TutorRegistro {
    return {
        ...crearTutorVacio(false),
        relacionTutorId: 2,
        apellidoPaterno: 'Meier',
        apellidoMaterno: 'Keller',
        nombres: 'Markus Peter'
    };
}

export function crearRegistroPostulanteVacio(postulanteId: number, tutorPrincipalId: number, tutorSegundoId: number): RegistroPostulante {
    return {
        postulanteId,
        tutorPrincipalId,
        tutorSegundoId,
        postulante: crearPostulanteVacio(),
        tutorPrincipal: crearTutorVacio(true),
        tutorSegundo: crearTutorVacio(false)
    };
}

export function crearRegistroPostulantesMock(): RegistroPostulantesSnapshot {
    return {
        version: 3,
        registros: [{
            postulanteId: 1,
            tutorPrincipalId: 1,
            tutorSegundoId: 2,
            postulante: crearPostulante(),
            tutorPrincipal: crearTutorPrincipal(),
            tutorSegundo: crearTutorSegundo()
        }, (() => {
            const postulante = crearPostulante();
            postulante.nombres = 'Mateo Alejandro'; postulante.fechaNacimiento = '2020-09-20'; postulante.documentoIdentidad = '78451237';
            return { postulanteId: 3, tutorPrincipalId: 1, tutorSegundoId: 2, postulante, tutorPrincipal: crearTutorPrincipal(), tutorSegundo: crearTutorSegundo() };
        })()],
        siguienteId: 100
    };
}
