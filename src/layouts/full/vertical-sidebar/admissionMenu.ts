import { HomeIcon, SchoolIcon, UserPlusIcon } from 'vue-tabler-icons';
import { ROL_PERSONAL, ROL_TUTOR, type AdmissionRole } from '@/constants/roles';
import type { menu } from './sidebarItem';

export function getAdmissionMenu(roles: readonly AdmissionRole[]): menu[] {
    if (roles.includes(ROL_PERSONAL)) {
        return [
            { header: 'ADMISIÓN' },
            { title: 'Admisión', icon: SchoolIcon, to: '/admision/convocatorias' },
            { title: 'Postulantes', icon: UserPlusIcon, to: '/admision/postulantes' }
        ];
    }

    if (roles.includes(ROL_TUTOR)) {
        return [
            { header: 'ADMISIÓN' },
            { title: 'Inicio', icon: HomeIcon, to: '/dashboards/modern' },
            { title: 'Mis postulaciones', icon: UserPlusIcon, to: '/postulantes' }
        ];
    }

    return [];
}
