const PostulantesRoutes = [
    {
        name: 'postulantes',
        path: '/postulantes',
        component: () => import('./views/MisPostulantes.vue')
    },
    {
        name: 'postulante-tutor-responsable-nuevo',
        path: '/postulantes/nuevo/tutor/:tutorId',
        component: () => import('./views/RegistroPostulante.vue')
    },
    {
        name: 'postulante-registro',
        path: '/postulantes/:postulanteId/registro',
        component: () => import('./views/RegistroPostulante.vue')
    },
    {
        name: 'postulante-tutor-registro',
        path: '/postulantes/:postulanteId/tutores/:tutorId/registro',
        component: () => import('./views/RegistroPostulante.vue')
    },
    {
        name: 'postulante-detalle',
        path: '/postulantes/:postulanteId',
        component: () => import('./views/PostulanteDetail.vue')
    }
];

export default PostulantesRoutes;
