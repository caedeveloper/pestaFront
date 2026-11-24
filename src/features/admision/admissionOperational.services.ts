import type { ApplicantAdmission } from './admissionOperational.store';

const storageKey = 'heinrich-admision-operacion-v1';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Mock transport for applicant admissions; replace with admission API endpoints later. */
export const useAdmissionOperationalService = () => ({
    fetchAll(): ApplicantAdmission[] {
        if (typeof window === 'undefined') return [];
        try { return clone(JSON.parse(window.localStorage.getItem(storageKey) || '[]') as ApplicantAdmission[]); } catch { return []; }
    },
    saveAll(items: ApplicantAdmission[]): void {
        if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(items));
    },
    hasExternalChange(event: StorageEvent): boolean { return event.key === storageKey; }
});
