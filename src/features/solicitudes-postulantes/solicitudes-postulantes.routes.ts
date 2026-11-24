import { ROL_PERSONAL } from '@/constants/roles';

export default [
    { name: 'admision-postulantes', path: '/admision/postulantes', component: () => import('./views/SolicitudesPostulantesList.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-postulante-detalle', path: '/admision/postulantes/:postulanteId', component: () => import('./views/SolicitudPostulanteDetail.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } }
];
