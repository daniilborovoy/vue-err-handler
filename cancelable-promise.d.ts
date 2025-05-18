export type CancelablePromiseExecutor<T> = (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
) => void;

export declare class CancelablePromise<T> {
    private hasCanceled: boolean;
    private readonly innerPromise: Promise<T>;

    constructor(executor: CancelablePromiseExecutor<T>);

    /**
     * Cancels the promise, preventing it from resolving or rejecting
     */
    cancel(): void;

    /**
     * Returns the inner promise that can be awaited
     */
    get promise(): Promise<T>;
}