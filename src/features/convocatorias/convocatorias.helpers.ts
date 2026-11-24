import type { AdmissionStage, StageTutorPermissions } from '@/mocks/convocatorias.mock';

/** Legacy stages keep their established document-upload behaviour. */
export const legacyStageTutorPermissions: StageTutorPermissions = {
    canEditApplicant: false,
    canEditOwnData: false,
    canAddTutors: false,
    canManageTutors: false,
    canEditDocuments: true
};

export const newStageTutorPermissions = (): StageTutorPermissions => ({
    canEditApplicant: false,
    canEditOwnData: false,
    canAddTutors: false,
    canManageTutors: false,
    canEditDocuments: false
});

export function stageTutorPermissions(stage?: AdmissionStage): StageTutorPermissions {
    return { ...legacyStageTutorPermissions, ...(stage?.tutorPermissions || {}) };
}

export function stageIsAvailable(stage?: AdmissionStage, now = new Date()): boolean {
    if (!stage) return false;
    return (!stage.fechaInicio || new Date(stage.fechaInicio) <= now) && (!stage.fechaCierre || new Date(stage.fechaCierre) >= now);
}

export function effectiveStageTutorPermissions(stage?: AdmissionStage, now = new Date()): StageTutorPermissions {
    const permissions = stageTutorPermissions(stage);
    if (stageIsAvailable(stage, now)) return permissions;
    return {
        canEditApplicant: false,
        canEditOwnData: false,
        canAddTutors: false,
        canManageTutors: false,
        canEditDocuments: false
    };
}
