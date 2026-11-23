import { ROL_PERSONAL } from '@/constants/roles';

export default [
    { name: 'admision-convocatorias', path: '/admision/convocatorias', component: () => import('./views/ConvocatoriasList.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-postulantes', path: '/admision/postulantes', component: () => import('./views/PostulantesAdmin.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-postulante-detalle', path: '/admision/postulantes/:postulanteId', component: () => import('./views/PostulanteAdminDetail.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-convocatoria-nueva', path: '/admision/convocatorias/nueva', component: () => import('./views/ConvocatoriaEditor.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-convocatoria-configurar', path: '/admision/convocatorias/:id', component: () => import('./views/ConvocatoriaEditor.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } }
];
