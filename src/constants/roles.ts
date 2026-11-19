/** Roles verificados en Pestalozzi.Heinrich.WebFront. */
export const ROL_PERSONAL = 'Personal';
export const ROL_TUTOR = 'Tutor';

export type AdmissionRole = typeof ROL_PERSONAL | typeof ROL_TUTOR;

export function hasAdmissionRole(roles: readonly string[] | undefined, role: AdmissionRole) {
    return roles?.includes(role) ?? false;
}
