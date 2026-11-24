import { asegurarReferencias } from './postulantes.helpers';
import { crearRegistroPostulantesMock } from '@/mocks/postulantes.mock';
import type { RegistroPostulante, RegistroPostulantesSnapshot } from './postulantes.types';

const POSTULANTES_STORAGE_KEY = 'heinrich-postulantes-registro-v3';
const LEGACY_POSTULANTES_STORAGE_KEYS = [
    'heinrich-postulantes-registro-v2',
    'heinrich-postulantes-registro-v1',
    'heinrich-admision-registro-v1'
];

type RegistroLegacy = Partial<RegistroPostulante> & {
    version?: number;
    registros?: unknown;
    siguienteId?: number;
};

function esRegistroValido(registro: Partial<RegistroPostulante>): registro is RegistroPostulante {
    return typeof registro.postulanteId === 'number'
        && typeof registro.tutorPrincipalId === 'number'
        && typeof registro.tutorSegundoId === 'number'
        && Boolean(registro.postulante)
        && Boolean(registro.tutorPrincipal)
        && Boolean(registro.tutorSegundo);
}

function migrarRegistroUnico(registro: RegistroLegacy): RegistroPostulantesSnapshot | null {
    if (!registro.postulante || !registro.tutorPrincipal || !registro.tutorSegundo || typeof registro.siguienteId !== 'number') return null;
    return {
        version: 3,
        registros: [{
            postulanteId: typeof registro.postulanteId === 'number' ? registro.postulanteId : 1,
            tutorPrincipalId: typeof registro.tutorPrincipalId === 'number' ? registro.tutorPrincipalId : 1,
            tutorSegundoId: typeof registro.tutorSegundoId === 'number' ? registro.tutorSegundoId : 2,
            postulante: registro.postulante,
            tutorPrincipal: registro.tutorPrincipal,
            tutorSegundo: registro.tutorSegundo
        }],
        siguienteId: registro.siguienteId
    };
}

function deSnapshotAlmacenado(valor: string | null): RegistroPostulantesSnapshot | null {
    if (!valor) return null;
    try {
        const snapshot: unknown = JSON.parse(valor);
        if (!snapshot || typeof snapshot !== 'object') return null;
        const registro = snapshot as RegistroLegacy;

        if (registro.version === 3 && Array.isArray(registro.registros) && typeof registro.siguienteId === 'number') {
            const registros = registro.registros as Partial<RegistroPostulante>[];
            if (registros.length && registros.every(esRegistroValido)) {
                registros.forEach((item) => asegurarReferencias(item.postulante));
                return { version: 3, registros, siguienteId: registro.siguienteId };
            }
        }

        if (registro.version === 1 || registro.version === 2) return migrarRegistroUnico(registro);
        return null;
    } catch {
        return null;
    }
}

const usePostulantesService = () => {
    const fetchRegistro = async (): Promise<RegistroPostulantesSnapshot> => {
        if (typeof window === 'undefined') return crearRegistroPostulantesMock();
        const storage = window.localStorage;
        const registro = deSnapshotAlmacenado(storage.getItem(POSTULANTES_STORAGE_KEY))
            ?? LEGACY_POSTULANTES_STORAGE_KEYS.map((key) => deSnapshotAlmacenado(storage.getItem(key))).find(Boolean)
            ?? crearRegistroPostulantesMock();
        registro.registros.forEach((item) => asegurarReferencias(item.postulante));
        storage.setItem(POSTULANTES_STORAGE_KEY, JSON.stringify(registro));
        return registro;
    };

    const saveRegistro = async (registro: RegistroPostulantesSnapshot): Promise<void> => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(POSTULANTES_STORAGE_KEY, JSON.stringify(registro));
        }
    };

    return { fetchRegistro, saveRegistro };
};

export default usePostulantesService;
