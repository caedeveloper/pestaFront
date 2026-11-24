import type { AdmissionStage, Convocatoria } from '@/mocks/convocatorias.mock';
import { nextConvocatoriaMockId, readConvocatoriasMock, saveConvocatoriaMock } from '@/mocks/convocatorias.store';
import { ref } from 'vue';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const convocatoriasCache = ref<Convocatoria[]>(readConvocatoriasMock());

export const useConvocatoriasService = () => ({
    async obtenerConvocatorias(): Promise<Convocatoria[]> {
        return clone(readConvocatoriasMock());
    },
    async obtenerEtapas(convocatoriaId: string): Promise<AdmissionStage[]> {
        return clone(readConvocatoriasMock().find(item => item.id === convocatoriaId)?.etapas || []);
    },
    async obtenerConvocatoria(id: string): Promise<Convocatoria | undefined> { 
        return clone(readConvocatoriasMock().find(item => item.id === id)); 
    },
    async guardarConvocatoria(item: Convocatoria): Promise<Convocatoria> { 
        return clone(saveConvocatoriaMock(item)); 
    },
    async siguienteId(): Promise<string> { return nextConvocatoriaMockId(); }
});

export const useConvocatoriasCache = () => ({
    convocatorias: convocatoriasCache,
    refresh: () => { convocatoriasCache.value = readConvocatoriasMock(); },
    get: (id: string) => convocatoriasCache.value.find(item => item.id === id),
    save: (item: Convocatoria) => { const saved = saveConvocatoriaMock(item); convocatoriasCache.value = readConvocatoriasMock(); return saved; },
    nextId: () => nextConvocatoriaMockId()
});
const cache = useConvocatoriasCache();
export const convocatorias = cache.convocatorias;
export const refreshConvocatorias = cache.refresh;
export const getConvocatoria = cache.get;
export const saveConvocatoria = cache.save;
export const nextConvocatoriaId = cache.nextId;
