import { reactive, ref } from "vue";
import { CancelablePromise } from "./cancelable-promise";

const MAX_DELAY = 60000;
const INITIAL_DELAY = 5000;

class ErrorHandler {
    constructor(func, params = {}) {
        this.func = func;
        this.params = reactive({ ...params });
        this.secondsBeforeRetry = ref(0);
        this.error = ref(null);
        this.interval = null;
        this.cancelablePromise = null;
        this.completed = false;
        this.isLoading = ref(params?.isLoadingInitial !== undefined ? params.isLoadingInitial : false);
        this.attempts = 0;
    }

    async handler(...args) {
        this.completed = false;
        this.attempts = 0; // Reset attempts at the start of a new operation
        while (!this.completed) {
            try {
                this.isLoading.value = true;
                this.error.value = null;
                await this.func(...args);
                this.params.onSuccess?.();
                this.completed = true;
            } catch (err) {
                console.error(err);
                this.isLoading.value = false;
                this.params.onError?.(err);
                this.error.value = err;

                if (!this.params.retryOnError) {
                    this.completed = true;
                    return;
                }

                const delay = Math.min(
                    INITIAL_DELAY * Math.pow(2, this.attempts),
                    MAX_DELAY
                );
                console.info(`Retrying after ${delay / 1000}s...`);

                this.clearIntervalAndPromise();

                this.secondsBeforeRetry.value = delay / 1000;
                this.interval = setInterval(() => {
                    this.secondsBeforeRetry.value -= 1;
                    console.info(`Retrying in ${this.secondsBeforeRetry.value}s...`);
                }, 1000);

                this.cancelablePromise = new CancelablePromise((res) =>
                    setTimeout(res, delay)
                );

                await this.cancelablePromise.promise;

                this.attempts += 1;
                this.clearIntervalAndPromise();
            } finally {
                this.isLoading.value = false;
                this.params.onFinally?.();
            }
        }
    }

    stopRetry() {
        this.params.retryOnError = false;
        this.clearIntervalAndPromise();
        this.attempts = 0;
    }

    clearIntervalAndPromise() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.cancelablePromise) {
            this.cancelablePromise.cancel();
            this.cancelablePromise = null;
        }
    }
}

export const useErrHandler = (func, params = {}) => {
    const errorHandler = new ErrorHandler(func, params);

    return {
        secondsBeforeRetry: errorHandler.secondsBeforeRetry,
        error: errorHandler.error,
        stopRetry: errorHandler.stopRetry.bind(errorHandler),
        handler: errorHandler.handler.bind(errorHandler),
        loading: errorHandler.isLoading,
    };
}; 