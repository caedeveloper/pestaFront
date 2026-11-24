import { convocatoriasMock, type Convocatoria } from './convocatorias.mock';
import { legacyStageTutorPermissions } from './stageTutorPermissions';

const storageKey = 'heinrich-admision-convocatorias';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function normalize(items: Convocatoria[]): Convocatoria[] {
    return items.map((item) => ({
        ...item,
        etapas: (item.etapas || []).map((stage) => ({
            ...stage,
            workflowIds: stage.workflowIds || [],
            secciones: stage.secciones || [],
            connectionIds: stage.connectionIds || [],
            tutorPermissions: { ...legacyStageTutorPermissions, ...(stage.tutorPermissions || {}) }
        }))
    }));
}

/**
 * Mock transport for convocatorias. Replace only this adapter with HTTP calls
 * when the admission API is available; callers do not depend on localStorage.
 */
export const useConvocatoriasService = () => ({
    fetchAll(): Convocatoria[] {
        if (typeof window === 'undefined') return clone(convocatoriasMock);
        try {
            const saved = window.localStorage.getItem(storageKey);
            return normalize(saved ? JSON.parse(saved) as Convocatoria[] : clone(convocatoriasMock));
        } catch {
            return clone(convocatoriasMock);
        }
    },
    saveAll(items: Convocatoria[]): void {
        if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(items));
    },
    hasExternalChange(event: StorageEvent): boolean {
        return event.key === storageKey;
    }
});
