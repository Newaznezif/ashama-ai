
/**
 * Gesture Service - Touch gesture controls for mobile
 * Provides swipe, pinch, and multi-touch gesture detection
 */

import { useEffect, RefObject } from 'react';

type GestureCallback = (event: TouchEvent | MouseEvent) => void;

interface GestureHandlers {
    onSwipeLeft?: GestureCallback;
    onSwipeRight?: GestureCallback;
    onSwipeUp?: GestureCallback;
    onSwipeDown?: GestureCallback;
    onPinch?: (scale: number) => void;
    onDoubleTap?: GestureCallback;
}

class GestureService {
    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;
    private lastTapTime = 0;
    private initialPinchDistance = 0;

    private readonly SWIPE_THRESHOLD = 50; // pixels
    private readonly SWIPE_TIMEOUT = 300; // ms
    private readonly DOUBLE_TAP_DELAY = 300; // ms

    /**
     * Attach gesture listeners to an element
     */
    attach(element: HTMLElement, handlers: GestureHandlers): () => void {
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
                this.touchStartTime = Date.now();
            } else if (e.touches.length === 2) {
                // Pinch start
                this.initialPinchDistance = this.getPinchDistance(e.touches);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();

                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                const deltaTime = touchEndTime - this.touchStartTime;

                // Check for swipe
                if (deltaTime < this.SWIPE_TIMEOUT) {
                    if (Math.abs(deltaX) > this.SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                        // Horizontal swipe
                        if (deltaX > 0) {
                            handlers.onSwipeRight?.(e);
                        } else {
                            handlers.onSwipeLeft?.(e);
                        }
                    } else if (Math.abs(deltaY) > this.SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
                        // Vertical swipe
                        if (deltaY > 0) {
                            handlers.onSwipeDown?.(e);
                        } else {
                            handlers.onSwipeUp?.(e);
                        }
                    }
                }

                // Check for double tap
                if (touchEndTime - this.lastTapTime < this.DOUBLE_TAP_DELAY) {
                    handlers.onDoubleTap?.(e);
                }
                this.lastTapTime = touchEndTime;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && handlers.onPinch) {
                // Pinch gesture
                const currentDistance = this.getPinchDistance(e.touches);
                const scale = currentDistance / this.initialPinchDistance;
                handlers.onPinch(scale);
            }
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Return cleanup function
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchmove', handleTouchMove);
        };
    }

    /**
     * Calculate distance between two touch points
     */
    private getPinchDistance(touches: TouchList): number {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if device supports touch
     */
    isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// Export singleton instance
export const gestureService = new GestureService();

/**
 * React hook for gesture handling
 */
export const useGestures = (
    elementRef: RefObject<HTMLElement>,
    handlers: GestureHandlers
) => {
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const cleanup = gestureService.attach(element, handlers);
        return cleanup;
    }, [elementRef, handlers]);
};
