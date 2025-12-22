/**
 * Structured Logger with Context
 *
 * Provides centralized logging with automatic context (prId, requestId, timestamp).
 * Outputs JSON-formatted logs for better observability and searchability.
 */

export interface LogContext {
    /** Pull Request ID */
    prId?: number;
    /** Repository UUID */
    repoUuid?: string | null;
    /** Workspace UUID */
    workspaceUuid?: string | null;
    /** Commit hash */
    commitHash?: string | null;
    /** Request ID for correlation */
    requestId?: string;
    /** Any additional custom context */
    [key: string]: any;
}

/**
 * Centralized logger class with context propagation
 */
export class Logger {
    private context: LogContext;

    constructor(context: LogContext = {}) {
        this.context = {
            ...context,
            requestId: context.requestId || generateRequestId(),
        };
    }

    /**
     * Log informational message
     */
    info(message: string, data?: Record<string, any>): void {
        this.log('INFO', message, data);
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: Record<string, any>): void {
        this.log('WARN', message, data);
    }

    /**
     * Log error message with optional error object
     */
    error(message: string, error?: any, data?: Record<string, any>): void {
        this.log('ERROR', message, {
            ...data,
            error: error?.message || String(error),
            errorType: error?.name,
            stack: error?.stack,
        });
    }

    /**
     * Create child logger with extended context
     */
    child(additionalContext: Partial<LogContext>): Logger {
        return new Logger({ ...this.context, ...additionalContext });
    }

    /**
     * Internal log method
     */
    private log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: Record<string, any>): void {
        const logEntry = {
            level,
            timestamp: new Date().toISOString(),
            message,
            ...this.context,
            ...data,
        };

        // Output to appropriate console method
        switch (level) {
            case 'INFO':
                console.log(JSON.stringify(logEntry));
                break;
            case 'WARN':
                console.warn(JSON.stringify(logEntry));
                break;
            case 'ERROR':
                console.error(JSON.stringify(logEntry));
                break;
        }
    }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `req_${timestamp}_${random}`;
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: LogContext): Logger {
    return new Logger(context);
}
