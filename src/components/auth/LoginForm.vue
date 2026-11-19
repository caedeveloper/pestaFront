<script setup lang="ts">
import { computed, ref } from 'vue';
import { IdIcon, LockIcon, MailIcon, UserIcon, UserQuestionIcon } from 'vue-tabler-icons';
import { ROL_PERSONAL, ROL_TUTOR, type AdmissionRole } from '@/constants/roles';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const rol = ref<AdmissionRole>(ROL_TUTOR), usuario = ref(''), documento = ref(''), password = ref(''), submitting = ref(false), errorMessage = ref('');
const esTutor = computed(() => rol.value === ROL_TUTOR);
async function ingresar() {
    if (submitting.value) return;
    submitting.value = true; errorMessage.value = '';
    try { await authStore.loginExistente(usuario.value, password.value, rol.value, documento.value); notificationStore.notifySuccess('Sesión iniciada.'); }
    catch { errorMessage.value = esTutor.value ? 'No encontramos un tutor con ese correo o la contraseña no es válida.' : 'El usuario o la contraseña no son válidos.'; }
    finally { submitting.value = false; }
}
function cambiarRol() { usuario.value = ''; documento.value = ''; password.value = ''; errorMessage.value = ''; }
</script>
<template>
  <v-form @submit.prevent="ingresar">
    <v-label class="login-label">Ingresar como</v-label>
    <v-select v-model="rol" :items="[ROL_TUTOR, ROL_PERSONAL]" :prepend-inner-icon="UserQuestionIcon" variant="outlined" density="comfortable" hide-details class="mb-4" @update:model-value="cambiarRol" />
    <template v-if="esTutor"><v-label class="login-label">Correo electrónico</v-label><v-text-field v-model="usuario" :prepend-inner-icon="MailIcon" type="email" autocomplete="email" variant="outlined" density="comfortable" hide-details class="mb-4"/><v-label class="login-label">Documento de identidad</v-label><v-text-field v-model="documento" :prepend-inner-icon="IdIcon" autocomplete="off" variant="outlined" density="comfortable" hide-details class="mb-4"/></template>
    <template v-else><v-label class="login-label">Usuario</v-label><v-text-field v-model="usuario" :prepend-inner-icon="UserIcon" autocomplete="username" variant="outlined" density="comfortable" hide-details class="mb-4"/></template>
    <v-label class="login-label">Contraseña</v-label><v-text-field v-model="password" :prepend-inner-icon="LockIcon" type="password" autocomplete="current-password" variant="outlined" density="comfortable" hide-details class="mb-5"/>
    <v-btn size="large" :loading="submitting" color="primary" block type="submit">Iniciar sesión</v-btn>
    <p v-if="rol === ROL_PERSONAL" class="text-body-small text-medium-emphasis text-center mt-4 mb-0">Demo: usuario <strong>admin</strong> · contraseña <strong>admin</strong></p><p v-else class="text-body-small text-medium-emphasis text-center mt-4 mb-0">Demo: contraseña <strong>123456</strong></p>
  </v-form>
  <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-5" role="alert">{{ errorMessage }}</v-alert>
</template>
<style scoped>.login-label { font-weight: 600; color: rgb(var(--v-theme-textPrimary)); margin-bottom: .45rem; }</style>
