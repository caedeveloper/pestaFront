import { defineStore } from 'pinia';

export type NotificationColor = 'success' | 'info' | 'warning' | 'error';

export interface NotificationItem {
    id: number;
    message: string;
    color: NotificationColor;
    timeout: number;
}

export interface ConfirmationOptions {
    title?: string;
    acceptButtonText?: string;
    cancelButtonText?: string;
    hideCancelButton?: boolean;
}

export interface ConfirmationItem extends Required<ConfirmationOptions> {
    id: number;
    text: string;
    resolve: (accepted: boolean) => void;
}

export const useNotificationStore = defineStore('notification', {
    state: () => ({ nextId: 1, notifications: [] as NotificationItem[], confirmations: [] as ConfirmationItem[] }),
    actions: {
        notify(message: string, color: NotificationColor = 'info', timeout = 5000) {
            const item: NotificationItem = { id: this.nextId++, message, color, timeout };
            this.notifications.push(item);
            if (timeout > 0) window.setTimeout(() => this.removeNotification(item.id), timeout);
            return item.id;
        },
        notifySuccess(message: string, timeout = 5000) { return this.notify(message, 'success', timeout); },
        notifyInfo(message: string, timeout = 5000) { return this.notify(message, 'info', timeout); },
        notifyWarning(message: string, timeout = 5000) { return this.notify(message, 'warning', timeout); },
        notifyError(message: string, timeout = 0) { return this.notify(message, 'error', timeout); },
        removeNotification(id: number) { this.notifications = this.notifications.filter((item) => item.id !== id); },
        clearNotifications() { this.notifications = []; },
        confirm(text: string, options: ConfirmationOptions = {}) {
            return new Promise<boolean>((resolve) => {
                this.confirmations.push({
                    id: this.nextId++, text, resolve,
                    title: options.title ?? 'Confirmación',
                    acceptButtonText: options.acceptButtonText ?? 'Aceptar',
                    cancelButtonText: options.cancelButtonText ?? 'Cancelar',
                    hideCancelButton: options.hideCancelButton ?? false
                });
            });
        },
        resolveConfirmation(id: number, accepted: boolean) {
            const item = this.confirmations.find((confirmation) => confirmation.id === id);
            if (!item) return;
            item.resolve(accepted);
            this.confirmations = this.confirmations.filter((confirmation) => confirmation.id !== id);
        },
        reportHttpError(error: unknown) {
            const response = (error as { response?: { data?: { message?: string } } })?.response;
            this.notifyError(response?.data?.message || (error instanceof Error ? error.message : 'No se pudo completar la solicitud.'));
        }
    }
});

export default useNotificationStore;
