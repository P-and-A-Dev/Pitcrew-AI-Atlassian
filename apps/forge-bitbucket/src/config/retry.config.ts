/**
 * Retry Configuration
 * 
 * Defines retry behavior for Bitbucket API calls:
 * - Exponential backoff with jitter to avoid thundering herd
 * - Configurable timeouts
 * - Retryable HTTP status codes
 */

export const RETRY_CONFIG = {
    /** Maximum number of retry attempts */
    MAX_RETRIES: 3,

    /** Initial backoff delay in milliseconds */
    INITIAL_BACKOFF_MS: 1000,

    /** Maximum backoff delay in milliseconds */
    MAX_BACKOFF_MS: 10000,

    /** Exponential backoff multiplier */
    BACKOFF_MULTIPLIER: 2,

    /** Jitter factor (±30% randomness to prevent synchronized retries) */
    JITTER_FACTOR: 0.3,

    /** Default request timeout in milliseconds */
    REQUEST_TIMEOUT_MS: 30000,
} as const;

/**
 * HTTP status codes that should trigger a retry
 * - 408: Request Timeout
 * - 429: Too Many Requests (rate limiting)
 * - 500: Internal Server Error
 * - 502: Bad Gateway
 * - 503: Service Unavailable
 * - 504: Gateway Timeout
 */
export const RETRYABLE_STATUS_CODES = [
    408,
    429,
    500,
    502,
    503,
    504,
] as const;

export type RetryableStatusCode = typeof RETRYABLE_STATUS_CODES[number];
