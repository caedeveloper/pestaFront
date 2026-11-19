import { defineStore } from 'pinia';
import { router } from '@/router';
import usePostulantesService from '@/features/postulantes/postulantes.services';
import { useRegistroPostulanteStore } from '@/stores/registroPostulante';
import type { TutorRegistro } from '@/features/postulantes/postulantes.types';
import { ROL_PERSONAL, ROL_TUTOR, type AdmissionRole } from '@/constants/roles';

type SessionUser = {
    id: number;
    tutorId: number | null;
    username: string;
    firstName: string;
    lastName: string;
    token: string;
    mode: 'demo' | 'api';
    roles?: AdmissionRole[];
};

const sessionKey = 'heinrich-admision-demo-user';

function readSession(): SessionUser | null {
    try {
        const value = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
        return value && typeof value.firstName === 'string' && typeof value.token === 'string' ? value : null;
    } catch {
        return null;
    }
}

function nombreTutor(tutor: TutorRegistro) {
    return [tutor.nombres, tutor.apellidoPaterno].filter(Boolean).join(' ') || 'Tutor';
}

export const useAuthStore = defineStore('auth', {
    state: () => ({ user: readSession(), returnUrl: null as string | null }),
    getters: {
        accessToken: (state) => state.user?.token || null,
        hasRealSession: (state) => state.user?.mode === 'api',
        roles: (state): AdmissionRole[] => state.user?.roles?.length ? state.user.roles : state.user ? [ROL_TUTOR] : []
    },
    actions: {
        guardarSesion(user: SessionUser) {
            this.user = user;
            sessionStorage.setItem(sessionKey, JSON.stringify(user));
        },
        async loginExistente(correo: string, password: string, rol: AdmissionRole = ROL_TUTOR, documento?: string) {
            const identificador = correo.trim();
            if (import.meta.env.DEV && rol === ROL_PERSONAL && identificador.toLocaleLowerCase() === 'admin' && password === 'admin') {
                this.guardarSesion({ id: -1, tutorId: null, username: identificador, firstName: 'Administrador', lastName: '', token: 'demo-local', mode: 'demo', roles: [ROL_PERSONAL] });
                const destination = this.returnUrl || '/dashboards/modern';
                this.returnUrl = null;
                await router.push(destination);
                return;
            }
            if (rol !== ROL_TUTOR) throw new Error('Credenciales inválidas');
            if (password !== '123456') throw new Error('Contraseña inválida');
            const emailNormalizado = correo.trim().toLocaleLowerCase();
            if (import.meta.env.DEV && emailNormalizado === 'personal@heinrich.local') {
                this.guardarSesion({ id: -1, tutorId: null, username: correo.trim(), firstName: 'Personal de admisión', lastName: '', token: 'demo-local', mode: 'demo', roles: [ROL_PERSONAL] });
                const destination = this.returnUrl || '/admision/convocatorias';
                this.returnUrl = null;
                await router.push(destination);
                return;
            }
            const registro = await usePostulantesService().fetchRegistro();
            const coincidencia = registro.registros.flatMap((postulante) => [
                { id: postulante.tutorPrincipalId, tutor: postulante.tutorPrincipal },
                { id: postulante.tutorSegundoId, tutor: postulante.tutorSegundo }
            ]).find(({ tutor }) =>
                tutor.correoElectronico.trim().toLocaleLowerCase() === emailNormalizado &&
                tutor.documentoIdentidad.trim() === (documento || '').trim()
            );
            if (!coincidencia) throw new Error('Tutor no encontrado');

            this.guardarSesion({
                id: coincidencia.id,
                tutorId: coincidencia.id,
                username: correo.trim(),
                firstName: nombreTutor(coincidencia.tutor),
                lastName: '',
                token: 'demo-local',
                mode: 'demo',
                roles: [ROL_TUTOR]
            });
            const destination = this.returnUrl || '/dashboards/modern';
            this.returnUrl = null;
            await router.push(destination);
        },
        async iniciarTutorNuevo() {
            this.guardarSesion({
                id: 0,
                tutorId: null,
                username: '',
                firstName: 'Nuevo tutor',
                lastName: '',
                token: 'demo-local',
                mode: 'demo',
                roles: [ROL_TUTOR]
            });
            this.returnUrl = null;
            const tutorId = await useRegistroPostulanteStore().iniciarPostulanteConTutorNuevo();
            await router.push({ name: 'postulante-tutor-responsable-nuevo', params: { tutorId } });
        },
        asignarTutorActual(tutorId: number, tutor: TutorRegistro) {
            if (!this.user) return;
            this.guardarSesion({
                ...this.user,
                id: tutorId,
                tutorId,
                username: tutor.correoElectronico,
                firstName: nombreTutor(tutor)
            });
        },
        actualizarNombreDesdeTutor(tutor: TutorRegistro) {
            if (!this.user || (!tutor.nombres.trim() && !tutor.apellidoPaterno.trim())) return;
            const firstName = nombreTutor(tutor);
            if (this.user.firstName === firstName) return;
            this.guardarSesion({ ...this.user, firstName });
        },
        async logout() {
            this.user = null;
            this.returnUrl = null;
            sessionStorage.removeItem(sessionKey);
            await router.push('/auth/login');
        },
        establishApiSession(user: Omit<SessionUser, 'mode'>) {
            this.guardarSesion({ ...user, mode: 'api' });
        },
        async expireSession() {
            await this.logout();
        }
    }
});
