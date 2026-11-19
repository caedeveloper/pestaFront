<script setup lang="ts">
import { ref } from 'vue';
import { UserPlusIcon } from 'vue-tabler-icons';
import Logo from '@/layouts/full/logo/Logo.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const creatingTutor = ref(false);
async function registrarTutorNuevo() {
    creatingTutor.value = true;
    try { await auth.iniciarTutorNuevo(); } finally { creatingTutor.value = false; }
}
</script>

<template>
    <v-container fluid class="pa-3">
        <v-row class="heinrich-login d-flex justify-center align-center">
            <v-col cols="12" class="d-flex align-center">
                <v-card rounded="md" elevation="10" class="px-sm-1 px-0 mx-auto" max-width="780">
                    <v-card-item class="pa-6 pa-sm-8">
                        <div class="d-flex justify-center py-4"><Logo /></div>
                        <h1 class="text-display-small font-weight-bold mb-2 text-center">Bienvenido a Heinrich</h1>
                        <p class="text-title-large mb-6 text-center">Intranet del Colegio Pestalozzi</p>
                        <v-row dense>
                            <v-col cols="12" md="6" class="pe-md-6 tutor-new d-flex flex-column align-center text-center justify-center">
                                <div class="d-flex align-center ga-2 mb-4"><v-avatar color="lightprimary" size="38"><UserPlusIcon size="20" /></v-avatar><span class="font-weight-semibold">Tutor nuevo</span></div>
                                <p class="text-body-1 text-medium-emphasis mb-6">Registra tus datos como tutor responsable antes de crear la solicitud de tu hijo.</p>
                                <v-btn size="large" :loading="creatingTutor" color="primary" class="tutor-new-button" @click="registrarTutorNuevo">Registrar un postulante</v-btn>
                            </v-col>
                            <v-col cols="12" md="6" class="ps-md-6 existing-login"><LoginForm /></v-col>
                        </v-row>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
@media (min-width: 960px) { .existing-login { border-left: 1px solid rgb(var(--v-theme-borderColor)); } }
.tutor-new-button { width: 100%; }
</style>
