
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export const errorService = {
  logError: (error: Error, info?: any, severity: ErrorSeverity = 'error') => {
    // In a real application, this would send data to Sentry, LogRocket, or Datadog
    const timestamp = new Date().toISOString();
    
    console.error(`[ErrorService] [${severity.toUpperCase()}] ${timestamp}:`, {
      message: error.message,
      stack: error.stack,
      componentStack: info?.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });
    
    // We could store recent errors in localStorage for debugging
    if (typeof window !== 'undefined') {
        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.unshift({ timestamp, message: error.message, severity });
            if (logs.length > 50) logs.pop();
            localStorage.setItem('error_logs', JSON.stringify(logs));
        } catch (e) {
            // Ignore storage errors
        }
    }
  }
};
