import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            redirect: '/auth/404'
        },
        MainRoutes,
        AuthRoutes
    ]
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (requiresAuth && !auth.user) {
        auth.returnUrl = to.fullPath;
        return '/auth/login';
    }
    if (to.path === '/auth/login' && auth.user) return auth.returnUrl || '/dashboards/modern';
});
