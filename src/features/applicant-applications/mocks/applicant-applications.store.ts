import type { ApplicantApplication } from '../applicant-applications.types';
import { applicantApplicationsSeed } from './applicant-applications.seed';
const STORAGE_KEY = 'heinrich-admision-operacion-v1';
function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}
function read(): ApplicantApplication[] {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value ? (JSON.parse(value) as ApplicantApplication[]) : clone(applicantApplicationsSeed);
    } catch {
        return clone(applicantApplicationsSeed);
    }
}
function write(items: ApplicantApplication[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
export const applicantApplicationsStore = {
    list: (): ApplicantApplication[] => clone(read()),
    get: (postulanteId: number): ApplicantApplication | undefined => clone(read().find((item) => item.postulanteId === postulanteId)),
    set(item: ApplicantApplication): ApplicantApplication {
        const items = read();
        const index = items.findIndex((current) => current.postulanteId === item.postulanteId);
        if (index >= 0) items[index] = clone(item);
        else items.push(clone(item));
        write(items);
        return clone(item);
    },
    setAll(items: ApplicantApplication[]): void {
        write(clone(items));
    }
};
