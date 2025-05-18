export class CancelablePromise {
    constructor(executor) {
        this.hasCanceled = false;
        this.innerPromise = new Promise((resolve, reject) => {
            executor(
                (value) => {
                    if (!this.hasCanceled) {
                        resolve(value);
                    }
                },
                (error) => {
                    if (!this.hasCanceled) {
                        reject(error);
                    }
                }
            );
        });
    }

    cancel() {
        this.hasCanceled = true;
    }

    get promise() {
        return this.innerPromise;
    }
} 