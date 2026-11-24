import type { DataTableQuery } from '@/components/heinrich/heinrich-data-table/data-table.types';
import { applicantApplicationsMock } from './mocks/applicant-applications.mock';
import type {
    ApplicantApplication,
    ApplicantApplicationDetail,
    ApplicantApplicationListItem,
    BuscarApplicantApplicationsRequest,
    BuscarApplicantApplicationsResponse,
    ApplicantApplicationSummary,
    MoverApplicantApplicationStageRequest
} from './applicant-applications.types';
export const useApplicantApplicationsService = () => ({
    async buscarApplicantApplications(
        filters: BuscarApplicantApplicationsRequest,
        pagination: DataTableQuery<ApplicantApplicationListItem>
    ): Promise<BuscarApplicantApplicationsResponse> {
        return applicantApplicationsMock.buscarApplicantApplications({ ...filters, pagination });
    },
    async obtenerApplicantApplication(postulanteId: number): Promise<ApplicantApplication | undefined> {
        return applicantApplicationsMock.obtenerApplicantApplication(postulanteId);
    },
    async obtenerApplicantApplicationDetail(postulanteId: number): Promise<ApplicantApplicationDetail | undefined> {
        return applicantApplicationsMock.obtenerApplicantApplicationDetail(postulanteId);
    },
    async obtenerApplicantApplicationSummary(filters: BuscarApplicantApplicationsRequest): Promise<ApplicantApplicationSummary> {
        return applicantApplicationsMock.obtenerApplicantApplicationSummary(filters);
    },
    async guardarApplicantApplication(item: ApplicantApplication): Promise<ApplicantApplication> {
        return applicantApplicationsMock.guardarApplicantApplication(item);
    },
    async moverApplicantApplicationStage(request: MoverApplicantApplicationStageRequest): Promise<ApplicantApplication> {
        return applicantApplicationsMock.moverApplicantApplicationStage(request);
    }
});
export default useApplicantApplicationsService;
