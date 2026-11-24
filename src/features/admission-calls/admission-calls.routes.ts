import { ROL_PERSONAL } from '@/constants/roles';

export default [
    { name: 'admision-convocatorias', path: '/admision/convocatorias', component: () => import('./views/ListarAdmissionCall.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-convocatoria-nueva', path: '/admision/convocatorias/nueva', component: () => import('./views/ConfigurarAdmissionCall.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } },
    { name: 'admision-convocatoria-configurar', path: '/admision/convocatorias/:id', component: () => import('./views/ConfigurarAdmissionCall.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } }
];
