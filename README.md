# Vue Error Handler

A Vue 3 composable for handling asynchronous operations with automatic retry functionality and error management.
Perfect for handling API calls, form submissions, data fetching, and any asynchronous operations that may fail and require retry logic.

## Installation

```bash
npm install vue-err-handler
```

## Features

- Automatic retry mechanism with exponential backoff
- Loading state management
- Error state tracking
- Customizable success, error, and finally callbacks
- Ability to stop retry attempts
- Countdown timer for retry attempts

## Usage

```typescript
import { useErrHandler } from 'vue-err-handler';

// In your Vue component
const { handler, error, loading, secondsBeforeRetry, stopRetry } = useErrHandler(
  async () => {
    // Your async function here
    const response = await fetch('https://api.example.com/data');
    return response.json();
  },
  {
    onSuccess: () => {
      console.log('Operation succeeded!');
    },
    onError: (err) => {
      console.error('Operation failed:', err);
    },
    onFinally: () => {
      console.log('Operation completed');
    },
    retryOnError: true, // Enable automatic retry on error
    isLoadingInitial: false // Initial loading state
  }
);

// Call the handler
await handler();
```

## API Reference

### useErrHandler

The main composable function that creates an error handler instance.

#### Parameters

- `func`: `(...args: any[]) => Promise<T>` - The async function to handle
- `params`: `UseErrHandlerParams` (optional) - Configuration options
  - `onSuccess?: () => void` - Callback function called on successful operation
  - `onError?: (err: unknown) => void` - Callback function called when an error occurs
  - `onFinally?: () => void` - Callback function called after operation completes (success or error)
  - `retryOnError?: boolean` - Whether to automatically retry on error (default: false)
  - `isLoadingInitial?: boolean` - Initial loading state (default: false)

#### Returns

An object containing:

- `handler`: `(...args: any[]) => Promise<void>` - Function to execute the async operation
- `error`: `Ref<unknown | null>` - Reactive reference to the current error state
- `loading`: `Ref<boolean>` - Reactive reference to the loading state
- `secondsBeforeRetry`: `Ref<number>` - Reactive reference to the countdown timer for retry attempts
- `stopRetry`: `() => void` - Function to stop retry attempts

## Retry Behavior

The error handler implements an exponential backoff strategy for retries:

- Initial retry delay: 5 seconds
- Maximum retry delay: 60 seconds
- Each retry attempt doubles the previous delay
- The delay is capped at 60 seconds

## Example

```vue
<template>
  <div>
    <button @click="fetchData" :disabled="loading">
      {{ loading ? 'Loading...' : 'Fetch Data' }}
    </button>
    
    <div v-if="error">
      Error: {{ error }}
      <button @click="stopRetry">Stop Retrying</button>
      <div v-if="secondsBeforeRetry > 0">
        Retrying in {{ secondsBeforeRetry }} seconds...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useErrHandler } from 'vue-err-handler';

const fetchData = async () => {
  const { handler, error, loading, secondsBeforeRetry, stopRetry } = useErrHandler(
    async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    {
      retryOnError: true,
      onSuccess: () => {
        console.log('Data fetched successfully!');
      },
      onError: (err) => {
        console.error('Failed to fetch data:', err);
      }
    }
  );

  await handler();
};
</script>
```

## License

ISC