// src/utils/webVitals.ts
// Web Performance Monitoring - Tracks Core Web Vitals

export interface WebVitalsMetrics {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

// Log metrics to console (can be extended to send to analytics service)
const reportMetric = (metric: WebVitalsMetrics) => {
    // In production, send to analytics service (Google Analytics, Sentry, etc.)
    console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id
    });

    // Store in performance buffer for debugging
    if (typeof window !== 'undefined') {
        window.__webVitals = window.__webVitals || [];
        window.__webVitals.push(metric);
    }
};

// Initialize Web Vitals tracking
export const initWebVitals = async () => {
    if (typeof window === 'undefined') return;

    try {
        const vitals = await import('web-vitals') as any;

        // Check and report each metric if the function exists
        if (vitals.onCLS) vitals.onCLS(reportMetric);
        if (vitals.onFID) vitals.onFID(reportMetric);
        if (vitals.onFCP) vitals.onFCP(reportMetric);
        if (vitals.onLCP) vitals.onLCP(reportMetric);
        if (vitals.onTTFB) vitals.onTTFB(reportMetric);
        if (vitals.onINP) vitals.onINP(reportMetric);

        console.log('✅ Web Vitals tracking initialized');
    } catch (error) {
        console.warn('⚠️ Web Vitals library not available:', error);
    }
};

// Extend window type for TypeScript
declare global {
    interface Window {
        __webVitals?: WebVitalsMetrics[];
    }
}
