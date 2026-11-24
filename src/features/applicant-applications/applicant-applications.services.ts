import type { DataTableQuery } from '@/components/heinrich/heinrich-data-table/data-table.types';
import type { AdmissionStage } from '@/features/admission-calls/admission-calls.types';
import type { RegistroPostulante } from '@/features/postulantes/postulantes.types';
import { applicantApplicationsMock } from './mocks/applicant-applications.mock';
import type {
    ApplicantApplication,
    ApplicantApplicationListItem,
    BuscarApplicantApplicationsRequest,
    BuscarApplicantApplicationsResponse,
    MoverApplicantApplicationStageRequest
} from './applicant-applications.types';
export const useApplicantApplicationsService = () => ({
    async buscarApplicantApplications(
        registros: RegistroPostulante[],
        filters: BuscarApplicantApplicationsRequest,
        pagination: DataTableQuery<ApplicantApplicationListItem>
    ): Promise<BuscarApplicantApplicationsResponse> {
        return applicantApplicationsMock.buscarApplicantApplications({ ...filters, pagination, registros });
    },
    async obtenerApplicantApplication(postulanteId: number): Promise<ApplicantApplication | undefined> {
        return applicantApplicationsMock.obtenerApplicantApplication(postulanteId);
    },
    async asegurarApplicantApplications(
        postulanteIds: number[],
        convocatoriaId: string,
        stages: AdmissionStage[]
    ): Promise<ApplicantApplication[]> {
        return applicantApplicationsMock.asegurarApplicantApplications(postulanteIds, convocatoriaId, stages);
    },
    async guardarApplicantApplication(item: ApplicantApplication): Promise<ApplicantApplication> {
        return applicantApplicationsMock.guardarApplicantApplication(item);
    },
    async moverApplicantApplicationStage(request: MoverApplicantApplicationStageRequest): Promise<ApplicantApplication> {
        return applicantApplicationsMock.moverApplicantApplicationStage(request);
    }
});
export default useApplicantApplicationsService;
