
/**
 * Cache Service - Offline/Low-bandwidth mode support
 * Caches successful API responses with TTL for faster access and offline fallback
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'ashama_cache_';
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

class CacheService {
    /**
     * Store data in cache with TTL
     */
    set(key: string, data: any, ttl: number = DEFAULT_TTL): void {
        const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };

        try {
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
        } catch (error) {
            console.warn('Cache storage failed:', error);
        }
    }

    /**
     * Get data from cache if not expired
     */
    get(key: string): any | null {
        try {
            const item = localStorage.getItem(CACHE_PREFIX + key);
            if (!item) return null;

            const entry: CacheEntry = JSON.parse(item);
            const now = Date.now();

            // Check if expired
            if (now - entry.timestamp > entry.ttl) {
                this.delete(key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    /**
     * Delete specific cache entry
     */
    delete(key: string): void {
        try {
            localStorage.removeItem(CACHE_PREFIX + key);
        } catch (error) {
            console.warn('Cache deletion failed:', error);
        }
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Cache clear failed:', error);
        }
    }

    /**
     * Generate cache key from prompt
     */
    generateKey(prompt: string, mode?: string): string {
        const normalized = prompt.toLowerCase().trim();
        const hash = this.simpleHash(normalized);
        return mode ? `${mode}_${hash}` : hash;
    }

    /**
     * Simple hash function for cache keys
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Check if online
     */
    isOnline(): boolean {
        return navigator.onLine;
    }

    /**
     * Get offline fallback responses in Afaan Oromo
     */
    getOfflineFallback(prompt: string): string {
        const lowerPrompt = prompt.toLowerCase();

        // Greetings
        if (lowerPrompt.includes('nagaa') || lowerPrompt.includes('akkam')) {
            return "Nagaa! Ani Ashama. Yeroo ammaa interneetiin hin jiru, garuu si gargaaruuf qophaa'adha. Gaaffii kee irra deebi'ii yaali yoo interneetiin deebi'e.";
        }

        // General offline message
        return "Dhiifama, yeroo ammaa interneetiin hin jiru. Deebii sirrii siif kennuuf interneetii barbaada. Maaloo walitti dhufeenya kee mirkaneessiitii irra deebi'ii yaali.";
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Offline detection helpers
export const setupOfflineDetection = (
    onOnline: () => void,
    onOffline: () => void
): (() => void) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Return cleanup function
    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};
