import { ApiError, getErrorStatus, getNetworkErrorCode } from "./error.ts";

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  shouldRetryOnError: (error: unknown, retryFetchErrors?: boolean) => boolean;
  retryFetchErrors?: boolean;
  signal?: AbortSignal;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

export const DEFAULT_MAX_ATTEMPTS = 5; // 로컬의 경우 최대 재시도를 5회 정도로 기본 설정하는 것이 적합합니다.
export const FETCH_FAILED_MESSAGE = "fetch failed";
export const INCOMPLETE_JSON_MESSAGE = "incomplete json segment";

const LOCAL_RETRYABLE_NETWORK_CODES = [
  "ECONNREFUSED", // 서버가 아직 켜지는 중일 수 있음
  "ECONNRESET", // 서버가 크래시 후 재시작 중일 수 있음
  "ETIMEDOUT", // 일시적인 연산 큐(Queue) 병목
  "EPIPE", // 파이프 단절
];

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: DEFAULT_MAX_ATTEMPTS,
  initialDelayMs: 3000, // 로컬 LLM의 경우 초기 대기 3초가 적당합니다.
  maxDelayMs: 15000, // 최대 지연 15초
  shouldRetryOnError: isRetryableError,
};

export function createAbortError(): Error {
  const abortError = new Error("Aborted");
  abortError.name = "AbortError";
  return abortError;
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(createAbortError());
    }

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(createAbortError());
    }

    if (signal) {
      signal.addEventListener("abort", onAbort);
    }
  });
}

function logRetryAttempt(
  attempt: number,
  error: unknown,
  errorStatus?: number,
): void {
  let message = `[Retry] 시도 ${attempt} 실패. 백오프 재시도 중...`;
  if (errorStatus) {
    message = `[Retry] 시도 ${attempt} 실패 (HTTP Status: ${errorStatus}). 백오프 재시도 중...`;
  }
  console.warn(message, error);
}

export function isRetryableError(
  error: Error | unknown,
  retryFetchErrors?: boolean,
): boolean {
  const errorCode = getNetworkErrorCode(error);
  if (errorCode && LOCAL_RETRYABLE_NETWORK_CODES.includes(errorCode)) {
    return true;
  }

  if (retryFetchErrors && error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    if (
      lowerMessage.includes(FETCH_FAILED_MESSAGE) ||
      lowerMessage.includes(INCOMPLETE_JSON_MESSAGE)
    ) {
      return true;
    }
  }

  if (error instanceof ApiError) {
    if (error.status === 400) return false; // 400 Bad Request는 즉시 중단
    return (
      error.status === 429 ||
      error.status === 499 ||
      (error.status >= 500 && error.status < 600)
    );
  }

  const status = getErrorStatus(error);
  if (status !== undefined) {
    return status === 429 || status === 499 || (status >= 500 && status < 600);
  }

  return false;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  if (options?.signal?.aborted) {
    throw createAbortError();
  }

  if (options?.maxAttempts !== undefined && options.maxAttempts <= 0) {
    throw new Error("maxAttempts must be a positive number.");
  }

  const cleanOptions = options
    ? Object.fromEntries(
        Object.entries(options).filter((entry) => entry[1] != null),
      )
    : {};

  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    shouldRetryOnError,
    retryFetchErrors,
    signal,
    onRetry,
  } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...cleanOptions,
  };

  let attempt = 0;
  let currentDelay = initialDelayMs;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw createAbortError();
    }
  };

  while (attempt < maxAttempts) {
    throwIfAborted();
    attempt++;

    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      throwIfAborted();

      const errorStatus = getErrorStatus(error);
      const is500 =
        errorStatus !== undefined && errorStatus >= 500 && errorStatus < 600;

      const isRetryable = is500 || shouldRetryOnError(error, retryFetchErrors);

      if (attempt >= maxAttempts || !isRetryable) {
        throw error;
      }

      const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);
      const delayWithJitter = Math.max(0, currentDelay + jitter);

      if (onRetry) {
        onRetry(attempt, error, delayWithJitter);
      } else {
        logRetryAttempt(attempt, error, errorStatus);
      }

      try {
        await delay(delayWithJitter, signal);
      } catch (delayErr) {
        if (delayErr instanceof Error && delayErr.name === "AbortError") {
          throw delayErr;
        }
      }

      currentDelay = Math.min(maxDelayMs, currentDelay * 2);
    }
  }

  throw new Error("Retry attempts exhausted");
}
