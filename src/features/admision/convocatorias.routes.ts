import { ROL_PERSONAL } from '@/constants/roles';

export default [{ name: 'admision-convocatorias', path: '/admision/convocatorias', component: () => import('./views/ConvocatoriasList.vue'), meta: { restrictToRoles: [ROL_PERSONAL] } }];
