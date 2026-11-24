import type {
    AdmissionCall,
    AdmissionStage,
    BuscarAdmissionCallsRequest,
    CatalogItem,
    StageGuardianPermissions
} from './admission-calls.types';

import type {
    DataTableQuery,
    PagedResponse
} from '@/components/heinrich/heinrich-data-table/data-table.types';

import { admissionCallsMock } from './mocks/admission-calls.mock';

export const useAdmissionCallsService = () => ({

    async obtenerAdmissionCallCatalog(): Promise<CatalogItem[]> {
        return admissionCallsMock.obtenerAdmissionCallCatalog();
    },

    async buscarAdmissionCalls(
        filters: BuscarAdmissionCallsRequest,
        pagination: DataTableQuery<AdmissionCall>
    ): Promise<PagedResponse<AdmissionCall>> {

        return admissionCallsMock.buscarAdmissionCalls({
            ...filters,
            pagination
        });
    },

    async obtenerAdmissionCall(
        id: string
    ): Promise<AdmissionCall | undefined> {
        return admissionCallsMock.obtenerAdmissionCall(id);
    },

    async guardarAdmissionCall(
        item: AdmissionCall
    ): Promise<AdmissionCall> {
        return admissionCallsMock.guardarAdmissionCall(item);
    },

    async generarAdmissionCallId(): Promise<string> {
        return admissionCallsMock.generarAdmissionCallId();
    },

    async obtenerStages(
        admissionCallId: string
    ): Promise<AdmissionStage[]> {
        return admissionCallsMock.obtenerStages(admissionCallId);
    },

    async obtenerStageGuardianPermissions(
        admissionCallId: string,
        stageId: string
    ): Promise<StageGuardianPermissions> {
        return admissionCallsMock.obtenerStageGuardianPermissions(
            admissionCallId,
            stageId
        );
    },

    async obtenerStatuses(): Promise<CatalogItem[]> {
        return admissionCallsMock.obtenerStatuses();
    },

    async obtenerAcademicYears(): Promise<CatalogItem[]> {
        return admissionCallsMock.obtenerAcademicYears();
    },

    async obtenerLevels(): Promise<CatalogItem[]> {
        return admissionCallsMock.obtenerLevels();
    },

    async obtenerGrades(
        level?: string
    ): Promise<CatalogItem[]> {
        return admissionCallsMock.obtenerGrades(level);
    }
});

export default useAdmissionCallsService;
