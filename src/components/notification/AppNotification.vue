<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();
const { notifications, confirmations } = storeToRefs(notificationStore);
</script>

<template>
    <div aria-live="polite">
        <v-snackbar
            v-for="notification in notifications"
            :key="notification.id"
            :model-value="true"
            :color="notification.color"
            :timeout="notification.timeout"
            location="bottom center"
            @update:model-value="notificationStore.removeNotification(notification.id)"
        >
            {{ notification.message }}
            <template #actions>
                <v-btn variant="text" aria-label="Cerrar notificación" @click="notificationStore.removeNotification(notification.id)">Cerrar</v-btn>
            </template>
        </v-snackbar>

        <v-dialog v-for="confirmation in confirmations" :key="confirmation.id" :model-value="true" persistent max-width="500">
            <v-card>
                <v-card-title>{{ confirmation.title }}</v-card-title>
                <v-card-text>{{ confirmation.text }}</v-card-text>
                <v-card-actions class="pb-5">
                    <v-spacer />
                    <v-btn v-if="!confirmation.hideCancelButton" variant="outlined" @click="notificationStore.resolveConfirmation(confirmation.id, false)">
                        {{ confirmation.cancelButtonText }}
                    </v-btn>
                    <v-btn color="primary" @click="notificationStore.resolveConfirmation(confirmation.id, true)">{{ confirmation.acceptButtonText }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
