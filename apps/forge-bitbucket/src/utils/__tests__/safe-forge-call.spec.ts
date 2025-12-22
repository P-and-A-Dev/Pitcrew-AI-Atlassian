/**
 * Unit Tests for Safe Forge Call Wrapper
 * Tests retry logic, backoff calculation, and error handling
 */

import {
	safeForgeCall,
	calculateBackoff,
	isRetryableError,
	sleep,
} from '../safe-forge-call';
import { RETRY_CONFIG } from '../../config/retry.config';

describe('safeForgeCall', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('calculateBackoff', () => {
		it('should calculate exponential backoff correctly', () => {
			const backoff0 = calculateBackoff(0);
			const backoff1 = calculateBackoff(1);
			const backoff2 = calculateBackoff(2);

			// Base values (before jitter)
			// attempt 0: 1000ms
			// attempt 1: 2000ms
			// attempt 2: 4000ms

			// With ±30% jitter
			expect(backoff0).toBeGreaterThanOrEqual(700); // 1000 - 30%
			expect(backoff0).toBeLessThanOrEqual(1300); // 1000 + 30%

			expect(backoff1).toBeGreaterThanOrEqual(1400); // 2000 - 30%
			expect(backoff1).toBeLessThanOrEqual(2600); // 2000 + 30%

			expect(backoff2).toBeGreaterThanOrEqual(2800); // 4000 - 30%
			expect(backoff2).toBeLessThanOrEqual(5200); // 4000 + 30%
		});

		it('should cap backoff at MAX_BACKOFF_MS', () => {
			const backoff10 = calculateBackoff(10); // Would be 1024000ms without cap

			// Should be capped at 10000ms ± jitter
			expect(backoff10).toBeLessThanOrEqual(RETRY_CONFIG.MAX_BACKOFF_MS * 1.3);
		});

		it('should add jitter randomness', () => {
			const backoffs = [];
			for (let i = 0; i < 10; i++) {
				backoffs.push(calculateBackoff(1));
			}

			// Not all values should be identical (jitter adds randomness)
			const uniqueValues = new Set(backoffs);
			expect(uniqueValues.size).toBeGreaterThan(1);
		});
	});

	describe('isRetryableError', () => {
		it('should identify retryable HTTP status codes', () => {
			const retryableCodes = [408, 429, 500, 502, 503, 504];

			for (const code of retryableCodes) {
				expect(isRetryableError({response: {status: code}})).toBe(true);
				expect(isRetryableError({status: code})).toBe(true);
			}
		});

		it('should NOT retry 4xx client errors (except 408, 429)', () => {
			const nonRetryableCodes = [400, 401, 403, 404, 422];

			for (const code of nonRetryableCodes) {
				expect(isRetryableError({response: {status: code}})).toBe(false);
				expect(isRetryableError({status: code})).toBe(false);
			}
		});

		it('should identify retryable network errors', () => {
			expect(isRetryableError({code: 'ECONNRESET'})).toBe(true);
			expect(isRetryableError({code: 'ETIMEDOUT'})).toBe(true);
			expect(isRetryableError({code: 'ENOTFOUND'})).toBe(true);
			expect(isRetryableError({code: 'ENETUNREACH'})).toBe(true);
		});

		it('should identify timeout errors by message', () => {
			expect(isRetryableError({message: 'Request timeout after 30000ms'})).toBe(true);
			expect(isRetryableError({message: 'Connection timed out'})).toBe(true);
		});

		it('should NOT retry non-retryable errors', () => {
			expect(isRetryableError({message: 'Invalid input'})).toBe(false);
			expect(isRetryableError(new Error('Random error'))).toBe(false);
			expect(isRetryableError(null)).toBe(false);
		});
	});

	describe('safeForgeCall - Success scenarios', () => {
		it('should succeed on first try without retry', async () => {
			const mockFn = jest.fn().mockResolvedValue({ok: true, data: 'success'});

			const result = await safeForgeCall(mockFn, {context: 'test'});

			expect(result).toEqual({ok: true, data: 'success'});
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should succeed after 1 retry on 503 error', async () => {
			const mockFn = jest
			.fn()
			.mockRejectedValueOnce({status: 503}) // First call fails
			.mockResolvedValueOnce({ok: true}); // Second call succeeds

			const result = await safeForgeCall(mockFn, {context: 'test', maxRetries: 2});

			expect(result).toEqual({ok: true});
			expect(mockFn).toHaveBeenCalledTimes(2);
		});

		it('should succeed after multiple retries', async () => {
			const mockFn = jest
			.fn()
			.mockRejectedValueOnce({status: 502})
			.mockRejectedValueOnce({status: 503})
			.mockResolvedValueOnce({ok: true});

			const result = await safeForgeCall(mockFn, {context: 'test'});

			expect(result).toEqual({ok: true});
			expect(mockFn).toHaveBeenCalledTimes(3);
		});
	});

	describe('safeForgeCall - Failure scenarios', () => {
		it('should return null after max retries exhausted', async () => {
			const mockFn = jest.fn().mockRejectedValue({status: 500});

			const result = await safeForgeCall(mockFn, {context: 'test', maxRetries: 2});

			expect(result).toBeNull();
			expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
		});

		it('should NOT retry on 404 Not Found', async () => {
			const mockFn = jest.fn().mockRejectedValue({status: 404});

			const result = await safeForgeCall(mockFn, {context: 'test'});

			expect(result).toBeNull();
			expect(mockFn).toHaveBeenCalledTimes(1); // No retry
		});

		it('should NOT retry on 401 Unauthorized', async () => {
			const mockFn = jest.fn().mockRejectedValue({status: 401});

			const result = await safeForgeCall(mockFn, {context: 'test'});

			expect(result).toBeNull();
			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('safeForgeCall - Timeout', () => {
		it('should timeout after specified duration', async () => {
			const mockFn = jest.fn().mockReturnValue(new Promise(() => {})); // no timers

			const result = await safeForgeCall(mockFn, {
				context: 'test',
				timeout: 100,
				maxRetries: 0,
			});

			expect(result).toBeNull();
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should retry after timeout if retryable', async () => {
			const mockFn = jest
			.fn()
			.mockReturnValueOnce(new Promise(() => {})) // pending, triggers timeout
			.mockResolvedValueOnce({ ok: true });

			const result = await safeForgeCall(mockFn, {
				context: 'test',
				timeout: 100,
				maxRetries: 1,
			});

			expect(result).toEqual({ ok: true });
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('safeForgeCall - Options', () => {
		it('should use custom maxRetries', async () => {
			const mockFn = jest.fn().mockRejectedValue({status: 503});

			await safeForgeCall(mockFn, {context: 'test', maxRetries: 1});

			expect(mockFn).toHaveBeenCalledTimes(2); // Initial + 1 retry
		});

		// Default maxRetries tested implicitly in other tests
		it('should use default maxRetries', async () => {
			jest.useFakeTimers();

			const mockFn = jest.fn().mockRejectedValue({status: 503});

			const p = safeForgeCall(mockFn, {context: 'test'});

			await jest.advanceTimersByTimeAsync(60_000);

			await p;

			expect(mockFn).toHaveBeenCalledTimes(RETRY_CONFIG.MAX_RETRIES + 1);

			jest.useRealTimers();
		});

	});

	describe('sleep', () => {
		it('should sleep for specified milliseconds', async () => {
			const start = Date.now();
			await sleep(100);
			const duration = Date.now() - start;

			expect(duration).toBeGreaterThanOrEqual(90); // Allow small margin
			expect(duration).toBeLessThan(150);
		});
	});
});

