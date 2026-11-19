<script setup lang="ts">
import Logo from '@/layouts/full/logo/Logo.vue';
import LoginForm from '@/components/auth/LoginForm.vue';

// Ejemplo original desactivado; se conserva para reutilización.
//
// import Logo from '@/layouts/full/logo/Logo.vue';
// /* Login form */
// import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <v-container fluid class="pa-3">
        <v-row class="heinrich-login d-flex justify-center align-center">
            <v-col cols="12" class="d-flex align-center">
                <v-card rounded="md" elevation="10" class="px-sm-1 px-0 mx-auto" max-width="760">
                    <v-card-item class="pa-6 pa-sm-8">
                        <div class="d-flex justify-center py-4"><Logo /></div>
                        <h1 class="text-display-small font-weight-bold mb-2 text-center">Bienvenido a Heinrich</h1>
                        <p class="text-title-large mb-6 text-center">Admisión del Colegio Pestalozzi</p>
                        <LoginForm />
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <!-- Demostración original desactivada.
<div class="pa-3">
        <v-row class="h-100vh mh-100 auth">
            <v-col cols="12" lg="7" xl="8"
                class="d-lg-flex align-center justify-center authentication position-relative">
                <div class="auth-header pt-lg-6 pt-2 px-sm-6 px-3 pb-lg-6 pb-0">
                    <div class="position-relative">
                        <Logo />
                    </div>
                </div>
                <div class="">
                    <img src="@/assets/images/backgrounds/login-bg.svg" class="position-relative d-none d-lg-flex"
                        alt="login-background" />
                </div>
            </v-col>
            <v-col cols="12" lg="5" xl="4" class="d-flex align-center justify-center">
                <div class="mt-xl-0 mt-5 mw-100">
                    <h2 class="text-display-small font-weight-bold mb-2">Welcome to Modernize</h2>
                    <div class="text-title-large mb-6">Your Admin Dashboard</div>
                    <LoginForm />
                    <h6 class="text-headline-small  d-flex align-center mt-6 font-weight-medium">
                        New to Modernize?
                        <v-btn class="pl-0 text-primary text-body-large opacity-1 pl-2 font-weight-medium" height="auto"
                            to="/auth/register" variant="plain">Create an account</v-btn>
                    </h6>
                </div>
            </v-col>
        </v-row>
    </div>
    -->
</template>
