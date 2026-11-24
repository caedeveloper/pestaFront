import { ROL_PERSONAL } from '@/constants/roles';

export default [
    {
        name: 'admision-postulantes',
        path: '/admision/postulantes',
        component: () => import('./views/ListarApplicantApplication.vue'),
        meta: { restrictToRoles: [ROL_PERSONAL] }
    },
    {
        name: 'admision-postulante-detalle',
        path: '/admision/postulantes/:postulanteId',
        component: () => import('./views/ConsultarApplicantApplication.vue'),
        meta: { restrictToRoles: [ROL_PERSONAL] }
    }
];
