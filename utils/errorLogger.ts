// src/utils/errorLogger.ts
// Centralized error logging and reporting

interface ErrorLogEntry {
    timestamp: Date;
    message: string;
    stack?: string;
    userAgent?: string;
    url?: string;
    userId?: string;
    context?: Record<string, any>;
}

/** Errores que suelen ser benignos (red, extensiones, ResizeObserver, interrupciones de voz) y no queremos reportar siempre. */
function isBenignError(message: string, context?: Record<string, any>): boolean {
    const msg = (message || '').toLowerCase();

    // ResizeObserver is a common harmless loop error in React apps
    if (msg.includes('resizeobserver') || msg.includes('resize observer')) return true;

    // Speech synthesis interruptions are normal when switching sounds quickly
    if (msg.includes('interrupted') && (msg.includes('speech') || msg.includes('promise'))) return true;
    if (msg === 'interrupted' || msg === 'error: interrupted') return true;

    if (typeof navigator === 'undefined') return false;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768);

    // Network/Chunk errors are often due to poor connectivity on mobile
    if (isMobile) {
        if (msg.includes('chunk') && (msg.includes('load') || msg.includes('fetch') || msg.includes('failed'))) return true;
        if (msg.includes('loading chunk') || msg.includes('dynamically imported module')) return true;
        if (msg.includes('script error') || msg === 'script error.') return true;
        if (msg.includes('network') && msg.includes('failed')) return true;
    }

    return false;
}

class ErrorLogger {
    private logs: ErrorLogEntry[] = [];
    private maxLogs = 100;

    constructor() {
        // Capture unhandled errors
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                const err = event.error || new Error(event.message);
                if (isBenignError(err.message, { filename: event.filename })) return;
                this.logError(err, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            // Capture unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                const message = typeof event.reason === 'object' && event.reason?.message ? event.reason.message : String(event.reason);
                if (isBenignError(message, { promise: true })) return;
                this.logError(new Error(`Unhandled Promise: ${event.reason}`), {
                    promise: true
                });
            });
        }
    }

    logError(error: Error, context?: Record<string, any>) {
        if (isBenignError(error.message, context)) return;
        const entry: ErrorLogEntry = {
            timestamp: new Date(),
            message: error.message,
            stack: error.stack,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            context
        };

        this.logs.push(entry);

        // Keep only the last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('[Error Logger]', {
                timestamp: entry.timestamp.toISOString(),
                message: entry.message,
                context: entry.context
            });
            if (entry.stack) {
                console.error('Stack:', entry.stack);
            }
        }

        // In production, could send to Sentry, LogRocket, or custom backend
        // Example: sendToSentry(entry);
    }

    getLogs(): ErrorLogEntry[] {
        return [...this.logs];
    }

    clearLogs() {
        this.logs = [];
    }

    // Export logs as JSON for debugging
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Convenience function for manual error logging
export const logError = (error: Error, context?: Record<string, any>) => {
    errorLogger.logError(error, context);
};

// Get error logs for display in admin panel
export const getErrorLogs = () => errorLogger.getLogs();

export const clearErrorLogs = () => errorLogger.clearLogs();
