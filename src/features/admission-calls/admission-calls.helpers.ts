import { CONTENT_TYPES } from './admission-calls.constants';
import type { AdmissionCall } from './admission-calls.types';
import { ADMISSION_CALL_INITIAL_VALUES, SCOPE_TYPES } from './admission-calls.constants';

import type {
    AdmissionContentItem,
    AdmissionSection,
    AdmissionActivity,
    StageGuardianPermissions
} from './admission-calls.types';
import type { AdmissionStage } from './admission-calls.types';

export function validarStageAvailability(stage: AdmissionStage | undefined, now = new Date()): boolean {
    return !!stage && (!stage.fechaInicio || new Date(stage.fechaInicio) <= now) &&
        (!stage.fechaCierre || new Date(stage.fechaCierre) >= now);
}

export function obtenerEffectiveStageGuardianPermissions(stage: AdmissionStage | undefined, now = new Date()): StageGuardianPermissions {
    return validarStageAvailability(stage, now) && stage ? { ...stage.guardianPermissions } : inicializarStageGuardianPermissions();
}

export function esAdmissionSection(
    item: AdmissionContentItem
): item is AdmissionSection {
    return item.tipo === CONTENT_TYPES.SECTION;
}

export function esAdmissionActivity(
    item: AdmissionContentItem
): item is AdmissionActivity {
    return !esAdmissionSection(item);
}

export function inicializarStageGuardianPermissions(): StageGuardianPermissions {
    return {
        canEditApplicant: false,
        canEditOwnData: false,
        canAddGuardians: false,
        canManageGuardians: false,
        canEditDocuments: false
    };
}

// #region AdmissionCall form

export function crearAdmissionCallVacia(
    id: string
): AdmissionCall {

    return {
        ...ADMISSION_CALL_INITIAL_VALUES,
        id,
        etapas: []
    };
}

export function validarAdmissionCallForm(
    item: AdmissionCall
) {

    const apertura = new Date(item.apertura).getTime();
    const cierre = new Date(item.cierre).getTime();

    return {
        nombre: !item.nombre.trim()
            ? 'El nombre de la convocatoria es obligatorio.'
            : '',

        anio: !item.anio
            ? 'Seleccione el ciclo académico.'
            : '',

        nivel: !item.nivel
            ? 'Seleccione el nivel educativo.'
            : '',

        grado:
            item.tipoAlcance === SCOPE_TYPES.GRADE &&
            !item.grado
                ? 'Seleccione el grado.'
                : '',

        apertura:
            !item.apertura || !Number.isFinite(apertura)
                ? 'Ingrese una fecha y hora de apertura válida.'
                : '',

        cierre:
            !item.cierre || !Number.isFinite(cierre)
                ? 'Ingrese una fecha y hora de cierre válida.'
                : Number.isFinite(apertura) && cierre <= apertura
                    ? 'El cierre debe ser posterior al inicio.'
                    : '',

        cupos:
            !Number.isInteger(Number(item.cupos)) ||
            Number(item.cupos) <= 0
                ? 'Ingrese un número entero positivo.'
                : '',

        reserva:
            !Number.isInteger(
                Number(item.duracionReservaMinutos)
            ) ||
            Number(item.duracionReservaMinutos) <= 0
                ? 'Ingrese un número entero positivo.'
                : ''
    };
}

// #endregion

