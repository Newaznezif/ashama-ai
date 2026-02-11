
/**
 * Notification Service - Toast notifications and alerts
 * Provides user feedback for actions and events
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

type NotificationListener = (notifications: Notification[]) => void;

class NotificationService {
    private notifications: Notification[] = [];
    private listeners: Set<NotificationListener> = new Set();
    private defaultDuration = 5000; // 5 seconds

    /**
     * Show a notification
     */
    show(
        type: NotificationType,
        title: string,
        message: string,
        duration?: number,
        action?: { label: string; onClick: () => void }
    ): string {
        const id = Date.now().toString() + Math.random();
        const notification: Notification = {
            id,
            type,
            title,
            message,
            duration: duration ?? this.defaultDuration,
            action,
        };

        this.notifications.push(notification);
        this.notifyListeners();

        // Auto-dismiss
        if (notification.duration > 0) {
            setTimeout(() => this.dismiss(id), notification.duration);
        }

        return id;
    }

    /**
     * Show success notification
     */
    success(title: string, message: string, duration?: number): string {
        return this.show('success', title, message, duration);
    }

    /**
     * Show error notification
     */
    error(title: string, message: string, duration?: number): string {
        return this.show('error', title, message, duration);
    }

    /**
     * Show warning notification
     */
    warning(title: string, message: string, duration?: number): string {
        return this.show('warning', title, message, duration);
    }

    /**
     * Show info notification
     */
    info(title: string, message: string, duration?: number): string {
        return this.show('info', title, message, duration);
    }

    /**
     * Dismiss a notification
     */
    dismiss(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyListeners();
    }

    /**
     * Dismiss all notifications
     */
    dismissAll(): void {
        this.notifications = [];
        this.notifyListeners();
    }

    /**
     * Subscribe to notification changes
     */
    subscribe(listener: NotificationListener): () => void {
        this.listeners.add(listener);
        listener(this.notifications); // Initial call

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener([...this.notifications]));
    }

    /**
     * Get all notifications
     */
    getAll(): Notification[] {
        return [...this.notifications];
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Predefined Afaan Oromo messages
export const OromoNotifications = {
    // Success messages
    copied: () => notificationService.success('Milkaa\'e!', 'Barreeffamni garagalfameera'),
    exported: () => notificationService.success('Milkaa\'e!', 'Seenaan alergameera'),
    saved: () => notificationService.success('Milkaa\'e!', 'Jijjiiramni kuufameera'),
    deleted: () => notificationService.success('Milkaa\'e!', 'Haqameera'),

    // Error messages
    networkError: () => notificationService.error('Dogoggora!', 'Walitti dhufeenya interneetii hin jiru'),
    apiError: () => notificationService.error('Dogoggora!', 'Tajaajilli hin argamne'),
    saveError: () => notificationService.error('Dogoggora!', 'Kuusuun hin milkoofne'),

    // Info messages
    offline: () => notificationService.info('Beeksisa', 'Yeroo ammaa interneetiin hin jiru'),
    online: () => notificationService.success('Milkaa\'e!', 'Interneetiin deebi\'eera'),

    // Streak messages
    streak: (days: number) => notificationService.success(
        '🔥 Walitti fufiinsa!',
        `Guyyaa ${days} walitti fufiinsaan fayyadamteetta!`
    ),
};
