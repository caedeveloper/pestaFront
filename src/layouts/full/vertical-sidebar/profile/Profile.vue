<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useCustomizerStore } from '@/stores/customizer';
import { PowerIcon } from 'vue-tabler-icons';
const authStore = useAuthStore();
const customizer = useCustomizerStore();

// Ejemplo original desactivado; se conserva para reutilización.
//
// import { useAuthStore } from '@/stores/auth';
//
// const authStore = useAuthStore();
</script>

<template>
    <v-sheet rounded="md" class="sidebar-profile pa-2" v-if="authStore.user">
        <div class="d-flex align-center ga-2" :class="{ 'flex-column': customizer.mini_sidebar }">
            <v-avatar size="34" color="primary" variant="tonal">{{ authStore.user.firstName?.[0]?.toUpperCase() || 'A' }}</v-avatar>
            <div v-if="!customizer.mini_sidebar" class="profile-details flex-grow-1">
                <p class="profile-name text-body-medium font-weight-semibold">{{ authStore.user.firstName }}</p>
                <p class="text-body-medium text-muted">Admisión</p>
            </div>
            <v-btn variant="text" icon size="small" color="primary" aria-label="Cerrar sesión" @click="authStore.logout()">
                <PowerIcon size="20" />
                <v-tooltip activator="parent">Cerrar sesión</v-tooltip>
            </v-btn>
        </div>
    </v-sheet>
    <!-- Demostración original desactivada.
<v-sheet rounded="md" color="lightsecondary" class="px-4 py-3 ExtraBox">
        <div class="d-flex align-center hide-menu">
            <v-avatar size="40">
                <img src="@/assets/images/profile/user-1.jpg" alt="user" height="40" />
            </v-avatar>
            <div class="ml-4">
                <h4 class="mb-n1 text-headline-small textPrimary">Mathew</h4>
                <span class="text-title-medium textSecondary">Designer</span>
            </div>
            <div class="ml-auto">
                <v-btn variant="text" icon rounded="md" color="primary" @click="authStore.logout()">
                    <PowerIcon />

                    <v-tooltip activator="parent" location="top">Logout</v-tooltip>
                </v-btn>
            </div>
        </div>
    </v-sheet>
    -->
</template>
