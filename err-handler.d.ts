import { Ref } from "vue";

export interface UseErrHandlerParams {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
    onFinally?: () => void;
    retryOnError?: boolean;
    isLoadingInitial?: boolean;
}

export interface ErrorHandlerReturn<T> {
    secondsBeforeRetry: Ref<number>;
    error: Ref<unknown | null>;
    stopRetry: () => void;
    handler: (...args: any[]) => Promise<T>;
    loading: Ref<boolean>;
}

export declare function useErrHandler<T>(
    func: (...args: any[]) => Promise<T>,
    params?: UseErrHandlerParams
): ErrorHandlerReturn<T>; 