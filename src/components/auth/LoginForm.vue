<script setup lang="ts">
import { ref } from 'vue';
import { LockIcon, UserIcon, UserPlusIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const correo = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref('');

async function ingresarExistente() {
    if (submitting.value) return;
    submitting.value = true;
    errorMessage.value = '';
    try {
        await authStore.loginExistente(correo.value, password.value);
        notificationStore.notifySuccess('Sesión iniciada.');
    } catch {
        errorMessage.value = 'No encontramos un tutor con ese correo o la contraseña no es válida.';
    } finally {
        submitting.value = false;
    }
}

async function registrarTutorNuevo() {
    if (submitting.value) return;
    submitting.value = true;
    try {
        await authStore.iniciarTutorNuevo();
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <v-row class="mt-2" dense>
        <v-col cols="12" md="6" class="pe-md-5">
            <div class="d-flex align-center ga-2 mb-3">
                <v-avatar color="lightprimary" size="38"><UserPlusIcon size="20" /></v-avatar>
                <div class="font-weight-semibold">Tutor nuevo</div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-5">Registra tus datos como tutor responsable antes de crear la solicitud de tu hijo.</p>
            <v-btn size="large" :loading="submitting" color="primary" block @click="registrarTutorNuevo">Registrar un postulante</v-btn>
        </v-col>

        <v-col cols="12" md="6" class="ps-md-5 existing-login">
            <div class="font-weight-semibold mb-3">Ya tengo una cuenta</div>
            <form @submit.prevent="ingresarExistente">
                <v-text-field v-model="correo" :prepend-inner-icon="UserIcon" label="Correo electrónico" type="email" autocomplete="email" class="mb-2" hide-details="auto" />
                <v-text-field v-model="password" :prepend-inner-icon="LockIcon" label="Contraseña" type="password" autocomplete="current-password" class="mb-4" hide-details="auto" />
                <v-btn size="large" :loading="submitting" color="primary" variant="tonal" block type="submit">Iniciar sesión</v-btn>
            </form>
            <p class="text-caption text-medium-emphasis text-center mt-3 mb-0">Demo: contraseña <strong>123456</strong></p>
        </v-col>
    </v-row>
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4" role="alert">{{ errorMessage }}</v-alert>
</template>

<style scoped>
@media (min-width: 960px) {
    .existing-login { border-left: 1px solid rgb(var(--v-theme-borderColor)); }
}
</style>
