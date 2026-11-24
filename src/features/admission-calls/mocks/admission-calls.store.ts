import type { AdmissionCall } from '../admission-calls.types';
import { admissionCallsSeed } from './admission-calls.seed';

const STORAGE_KEY = 'heinrich-admision-convocatorias-v2';

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function read(): AdmissionCall[] {
    const value = localStorage.getItem(STORAGE_KEY);

    if (value === null) {
        const items = clone(admissionCallsSeed);

        write(items);

        return items;
    }

    return JSON.parse(value) as AdmissionCall[];
}

function write(items: AdmissionCall[]): void {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
    );
}

export const admissionCallsStore = {

    list(): AdmissionCall[] {
        return read();
    },

    get(id: string): AdmissionCall | undefined {
        return read().find(item => item.id === id);
    },

    where(
        predicate: (item: AdmissionCall) => boolean
    ): AdmissionCall[] {
        return read().filter(predicate);
    },

    set(item: AdmissionCall): AdmissionCall {
        const items = read();

        const index = items.findIndex(
            current => current.id === item.id
        );

        if (index >= 0) {
            items[index] = clone(item);
        } else {
            items.unshift(clone(item));
        }

        write(items);

        return clone(item);
    },

    remove(id: string): boolean {
        const items = read();

        const index = items.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            return false;
        }

        items.splice(index, 1);

        write(items);

        return true;
    },

    exists(id: string): boolean {
        return read().some(item => item.id === id);
    },

    count(): number {
        return read().length;
    }
};