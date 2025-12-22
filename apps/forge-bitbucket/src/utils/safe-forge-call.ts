/**
 * Safe Forge API Call Wrapper
 *
 * Provides resilient API calls with:
 * - Automatic retry with exponential backoff + jitter
 * - Configurable timeouts
 * - Error classification (retryable vs non-retryable)
 * - Structured logging
 */

import { RETRY_CONFIG, RETRYABLE_STATUS_CODES } from '../config/retry.config';
import { createLogger } from './logger';

export interface SafeForgeCallOptions {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Request timeout in milliseconds (default: 30000) */
	timeout?: number;
	/** Context string for logging (e.g., 'fetchPrDiffStat') */
	context?: string;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		const t = setTimeout(resolve, ms);
		t.unref();
	});
}

/**
 * Calculate exponential backoff with jitter
 *
 * Formula: min(INITIAL * (MULTIPLIER ^ attempt), MAX) * (1 ± JITTER)
 *
 * @param attempt - Retry attempt number (0-indexed)
 * @returns Delay in milliseconds with jitter applied
 */
export function calculateBackoff(attempt: number): number {
	const { INITIAL_BACKOFF_MS, MAX_BACKOFF_MS, BACKOFF_MULTIPLIER, JITTER_FACTOR } = RETRY_CONFIG;

	// Exponential backoff
	const exponential = INITIAL_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, attempt);
	const capped = Math.min(exponential, MAX_BACKOFF_MS);

	// Add jitter: ±JITTER_FACTOR randomness
	const jitterRange = capped * JITTER_FACTOR;
	const jitter = (Math.random() * 2 - 1) * jitterRange; // Random between -jitterRange and +jitterRange

	return Math.max(0, Math.round(capped + jitter));
}

/**
 * Check if an error is retryable
 *
 * Retryable errors include:
 * - HTTP 408, 429, 5xx status codes
 * - Network errors (ECONNRESET, ETIMEDOUT, etc.)
 * - Timeout errors
 *
 * @param error - Error object to check
 * @returns true if error should trigger a retry
 */
export function isRetryableError(error: any): boolean {
	// Check HTTP response status
	if (error?.response?.status) {
		const status = error.response.status;
		return RETRYABLE_STATUS_CODES.includes(status as any);
	}

	// Check for Forge API error with status
	if (error?.status) {
		return RETRYABLE_STATUS_CODES.includes(error.status as any);
	}

	// Check for common network errors
	const errorCode = error?.code;
	if (errorCode) {
		const retryableNetworkErrors = [
			'ECONNRESET',
			'ETIMEDOUT',
			'ENOTFOUND',
			'ENETUNREACH',
			'EAI_AGAIN',
		];
		return retryableNetworkErrors.includes(errorCode);
	}

	// Check error message for timeout
	const errorMessage = error?.message?.toLowerCase() || '';
	if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
		return true;
	}

	// Not retryable
	return false;
}

/**
 * Execute a Forge API call with automatic retry and timeout
 *
 * Usage:
 * ```typescript
 * const response = await safeForgeCall(
 *   () => asApp().requestBitbucket(route`/2.0/repositories/${uuid}/...`),
 *   { context: 'fetchPrDiffStat' }
 * );
 *
 * if (!response || !response.ok) {
 *   console.error("Failed after retries");
 *   return null;
 * }
 * ```
 *
 * @param fn - Async function to execute (typically a Forge API call)
 * @param options - Retry and timeout options
 * @returns Promise resolving to result or null on failure
 */
export async function safeForgeCall<T>(
	fn: () => Promise<T>,
	options: SafeForgeCallOptions = {}
): Promise<T | null> {
	const {
		maxRetries = RETRY_CONFIG.MAX_RETRIES,
		timeout = RETRY_CONFIG.REQUEST_TIMEOUT_MS,
		context = 'unknownCall',
	} = options;

	const logger = createLogger({ component: 'safeForgeCall', context });
	let lastError: any;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
		}, timeout);

		timeoutId.unref();

		try {
			const result = await fnWithAbort(fn, controller.signal);

			clearTimeout(timeoutId);

			if (attempt > 0) {
				logger.info('Retry succeeded', {
					event: 'retry_success',
					attempt: attempt + 1,
					maxRetries: maxRetries + 1,
				});
			}

			return result;
		} catch (error: any) {
			clearTimeout(timeoutId);

			if (error.name === 'AbortError') {
				error = new Error(`Request timeout after ${timeout}ms`);
			}

			lastError = error;

			const shouldRetry = attempt < maxRetries && isRetryableError(error);

			if (shouldRetry) {
				const backoffMs = calculateBackoff(attempt);
				logger.warn('Retry attempt failed, retrying', {
					event: 'retry_attempt',
					attempt: attempt + 1,
					maxRetries: maxRetries + 1,
					backoffMs,
					errorMessage: getErrorMessage(error),
				});
				await sleep(backoffMs);
			} else {
				if (attempt >= maxRetries) {
					logger.error('All retry attempts exhausted', lastError, {
						event: 'retry_exhausted',
						attempts: maxRetries + 1,
					});
				} else {
					logger.error('Non-retryable error', error, {
						event: 'non_retryable_error',
					});
				}
				return null;
			}
		}
	}

	return null;
}

function fnWithAbort<T>(fn: () => Promise<T>, signal: AbortSignal): Promise<T> {
	return new Promise((resolve, reject) => {
		signal.addEventListener('abort', () => {
			reject(new DOMException('Aborted', 'AbortError'));
		});

		fn().then(resolve).catch(reject);
	});
}

/**
 * Extract readable error message from error object
 */
function getErrorMessage(error: any): string {
	if (error?.response?.status) {
		return `HTTP ${error.response.status}`;
	}

	if (error?.status) {
		return `Status ${error.status}`;
	}

	if (error?.code) {
		return `${error.code}`;
	}

	if (error?.message) {
		return error.message;
	}

	return String(error);
}
