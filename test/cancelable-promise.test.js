import { describe, it, expect, vi } from 'vitest';
import { CancelablePromise } from '../cancelable-promise';

describe('CancelablePromise', () => {
    it('should resolve with the executor result', async () => {
        const result = 'test result';
        const cancelablePromise = new CancelablePromise(resolve => resolve(result));

        await expect(cancelablePromise.promise).resolves.toBe(result);
    });

    it('should reject with the executor error', async () => {
        const error = new Error('test error');
        const cancelablePromise = new CancelablePromise((_, reject) => reject(error));

        await expect(cancelablePromise.promise).rejects.toThrow('test error');
    });

    it('should not resolve after being canceled', async () => {
        const cancelablePromise = new CancelablePromise(resolve => {
            setTimeout(() => resolve('resolved'), 100);
        });

        cancelablePromise.cancel();

        // Wait for the timeout
        await new Promise(resolve => setTimeout(resolve, 200));

        // The promise should never resolve after being canceled
        await expect(Promise.race([
            cancelablePromise.promise,
            new Promise(resolve => setTimeout(() => resolve('timeout'), 100))
        ])).resolves.toBe('timeout');
    });

    it('should not reject after being canceled', async () => {
        const cancelablePromise = new CancelablePromise((_, reject) => {
            setTimeout(() => reject(new Error('rejected')), 100);
        });

        cancelablePromise.cancel();

        // Wait for the timeout
        await new Promise(resolve => setTimeout(resolve, 200));

        // The promise should never reject after being canceled
        await expect(Promise.race([
            cancelablePromise.promise,
            new Promise(resolve => setTimeout(() => resolve('timeout'), 100))
        ])).resolves.toBe('timeout');
    });

    it('should handle multiple cancel calls gracefully', async () => {
        const cancelablePromise = new CancelablePromise(() => { });

        cancelablePromise.cancel();
        cancelablePromise.cancel(); // Second cancel should not throw

        // The promise should still be in a canceled state
        await expect(Promise.race([
            cancelablePromise.promise,
            new Promise(resolve => setTimeout(() => resolve('timeout'), 100))
        ])).resolves.toBe('timeout');
    });
}); 