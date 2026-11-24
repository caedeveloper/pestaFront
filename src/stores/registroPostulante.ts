import { defineStore } from 'pinia';
import { crearPostulanteVacio, crearRegistroPostulanteVacio, crearRegistroPostulantesMock, crearTutorVacio } from '@/mocks/postulantes.mock';
import { nombreCompleto, porcentaje, seccionesPostulante, seccionesTutor } from '@/features/postulantes/postulantes.helpers';
import type { EntidadId, PostulanteRegistro, RegistroPostulante, SeccionEstado, TutorEntidadId, TutorRegistro } from '@/features/postulantes/postulantes.types';
import usePostulantesService from '@/features/postulantes/postulantes.services';

function avanceDesdeSecciones(secciones: SeccionEstado[]) {
    const obligatorias = secciones.filter((seccion) => !seccion.opcional);
    return {
        porcentaje: porcentaje(secciones),
        completas: obligatorias.filter((seccion) => seccion.completa).length,
        total: obligatorias.length,
        pendientes: obligatorias.filter((seccion) => !seccion.completa).map((seccion) => seccion.titulo)
    };
}

function copiarTutor(tutor: TutorRegistro): TutorRegistro {
    return JSON.parse(JSON.stringify(tutor)) as TutorRegistro;
}

export const useRegistroPostulanteStore = defineStore('registroPostulante', {
    state: () => {
        const registroInicial = crearRegistroPostulantesMock();
        const activo = registroInicial.registros[0];
        return {
            registros: registroInicial.registros,
            postulanteId: activo.postulanteId,
            tutorPrincipalId: activo.tutorPrincipalId,
            tutorSegundoId: activo.tutorSegundoId,
            postulante: activo.postulante,
            tutorPrincipal: activo.tutorPrincipal,
            tutorSegundo: activo.tutorSegundo,
            siguienteId: registroInicial.siguienteId,
            registroNuevo: false,
            registroCargado: false
        };
    },
    getters: {
        nombreEstudiante: (state) => nombreCompleto(state.postulante),
        seccionesDelPostulante: (state) => seccionesPostulante(state.postulante),
        seccionesDelTutorPrincipal: (state) => seccionesTutor(state.tutorPrincipal),
        seccionesDelTutorSegundo: (state) => seccionesTutor(state.tutorSegundo)
    },
    actions: {
        seleccionarPostulante(postulanteId: number): boolean {
            const registro = this.registros.find((item) => item.postulanteId === postulanteId);
            if (!registro) return false;
            this.postulanteId = registro.postulanteId;
            this.tutorPrincipalId = registro.tutorPrincipalId;
            this.tutorSegundoId = registro.tutorSegundoId;
            this.postulante = registro.postulante;
            this.tutorPrincipal = registro.tutorPrincipal;
            this.tutorSegundo = registro.tutorSegundo;
            return true;
        },
        async cargarRegistro() {
            if (this.registroCargado) return;
            const registro = await usePostulantesService().fetchRegistro();
            this.registros = registro.registros;
            this.siguienteId = registro.siguienteId;
            this.seleccionarPostulante(registro.registros[0].postulanteId);
            this.registroCargado = true;
        },
        async guardarRegistro() {
            if (this.registroNuevo) this.crearRegistroDesdeTutorResponsable();
            this.sincronizarTutor(this.tutorPrincipalId, this.tutorPrincipal);
            this.sincronizarTutor(this.tutorSegundoId, this.tutorSegundo);
            await usePostulantesService().saveRegistro({
                version: 3,
                registros: this.registros,
                siguienteId: this.siguienteId
            });
        },
        async crearPostulanteParaTutor(tutorId: number): Promise<number | null> {
            const tutor = this.buscarTutorPorId(tutorId);
            if (!tutor) return null;
            const postulanteId = this.nuevoId();
            const tutorSegundoId = this.nuevoId();
            const registro = crearRegistroPostulanteVacio(postulanteId, tutorId, tutorSegundoId);
            registro.tutorPrincipal = copiarTutor(tutor);
            registro.tutorPrincipal.esTitular = true;
            this.registros.push(registro);
            this.seleccionarPostulante(postulanteId);
            await this.guardarRegistro();
            return postulanteId;
        },
        async iniciarPostulanteConTutorNuevo(): Promise<number> {
            await this.cargarRegistro();
            this.registroNuevo = true;
            this.postulante = crearPostulanteVacio();
            this.tutorPrincipal = crearTutorVacio(true);
            this.tutorSegundo = crearTutorVacio(false);
            this.crearRegistroDesdeTutorResponsable();
            await this.guardarRegistro();
            return this.tutorPrincipalId;
        },
        crearRegistroDesdeTutorResponsable() {
            const postulanteId = this.nuevoId();
            const tutorPrincipalId = this.nuevoId();
            const tutorSegundoId = this.nuevoId();
            const registro: RegistroPostulante = {
                postulanteId,
                tutorPrincipalId,
                tutorSegundoId,
                postulante: this.postulante,
                tutorPrincipal: this.tutorPrincipal,
                tutorSegundo: this.tutorSegundo
            };
            this.registros.push(registro);
            this.registroNuevo = false;
            this.seleccionarPostulante(postulanteId);
            return postulanteId;
        },
        nuevoId() {
            this.siguienteId += 1;
            return this.siguienteId;
        },
        seccionesDe(entidad: EntidadId): SeccionEstado[] {
            if (entidad === 'postulante') return this.seccionesDelPostulante;
            if (entidad === 'tutor-principal') return this.seccionesDelTutorPrincipal;
            return this.seccionesDelTutorSegundo;
        },
        seccionesDeRegistro(registro: RegistroPostulante, entidad: EntidadId): SeccionEstado[] {
            if (entidad === 'postulante') return seccionesPostulante(registro.postulante);
            return seccionesTutor(entidad === 'tutor-principal' ? registro.tutorPrincipal : registro.tutorSegundo);
        },
        tutorDe(entidad: TutorEntidadId): TutorRegistro {
            return entidad === 'tutor-principal' ? this.tutorPrincipal : this.tutorSegundo;
        },
        tutorIdDe(entidad: TutorEntidadId): number {
            return entidad === 'tutor-principal' ? this.tutorPrincipalId : this.tutorSegundoId;
        },
        entidadDeTutor(tutorId: number): TutorEntidadId | null {
            if (tutorId === this.tutorPrincipalId) return 'tutor-principal';
            if (tutorId === this.tutorSegundoId) return 'tutor-segundo';
            return null;
        },
        buscarTutorPorId(tutorId: number): TutorRegistro | null {
            for (const registro of this.registros) {
                if (registro.tutorPrincipalId === tutorId) return registro.tutorPrincipal;
                if (registro.tutorSegundoId === tutorId) return registro.tutorSegundo;
            }
            return null;
        },
        vincularTutorPorDocumento(entidad: TutorEntidadId, documento: string): boolean {
            const documentoNormalizado = documento.trim();
            if (!documentoNormalizado) return false;
            const activo = this.registros.find((registro) => registro.postulanteId === this.postulanteId);
            if (!activo) return false;
            for (const registro of this.registros) {
                const candidatos = [
                    { id: registro.tutorPrincipalId, tutor: registro.tutorPrincipal },
                    { id: registro.tutorSegundoId, tutor: registro.tutorSegundo }
                ];
                const encontrado = candidatos.find((candidato) => candidato.tutor.documentoIdentidad === documentoNormalizado);
                if (encontrado) {
                    if (entidad === 'tutor-principal') {
                        this.tutorPrincipalId = encontrado.id;
                        this.tutorPrincipal = copiarTutor(encontrado.tutor);
                        activo.tutorPrincipalId = encontrado.id;
                        activo.tutorPrincipal = this.tutorPrincipal;
                    } else {
                        this.tutorSegundoId = encontrado.id;
                        this.tutorSegundo = copiarTutor(encontrado.tutor);
                        activo.tutorSegundoId = encontrado.id;
                        activo.tutorSegundo = this.tutorSegundo;
                    }
                    return true;
                }
            }
            return false;
        },
        sincronizarTutor(tutorId: number, tutor: TutorRegistro) {
            if (!tutorId) return;
            for (const registro of this.registros) {
                if (registro.tutorPrincipalId === tutorId) registro.tutorPrincipal = copiarTutor(tutor);
                if (registro.tutorSegundoId === tutorId) registro.tutorSegundo = copiarTutor(tutor);
            }
            this.seleccionarPostulante(this.postulanteId);
        },
        avanceDe(entidad: EntidadId) {
            return avanceDesdeSecciones(this.seccionesDe(entidad));
        },
        avanceDeRegistro(registro: RegistroPostulante, entidad: EntidadId) {
            return avanceDesdeSecciones(this.seccionesDeRegistro(registro, entidad));
        },
        ficha(): PostulanteRegistro {
            return this.postulante;
        }
    }
});
