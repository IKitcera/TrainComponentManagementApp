import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {retry, timer} from 'rxjs';

/**
 * Retry interceptor with exponential backoff
 * Retries failed requests automatically before showing error to user
 * NOTE! Works with real http requests
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const initialDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error: HttpErrorResponse, retryCount) => {
        // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
        if (error.status >= 400 && error.status < 500) {
          if (error.status === 408 || error.status === 429) {
            // Retry on timeout or rate limit
            const delay = Math.min(initialDelay * Math.pow(2, retryCount - 1), maxDelay);
            console.log(`Retry attempt ${retryCount}/${maxRetries} after ${delay}ms for ${req.url}`);
            return timer(delay);
          }
          // Don't retry other client errors (400, 401, 403, 404, etc.)
          throw error;
        }

        // Retry on server errors (5xx) and network errors (0)
        if (error.status >= 500 || error.status === 0) {
          const delay = Math.min(initialDelay * Math.pow(2, retryCount - 1), maxDelay);
          console.log(`Retry attempt ${retryCount}/${maxRetries} after ${delay}ms for ${req.url}`);
          return timer(delay);
        }

        // Don't retry other errors
        throw error;
      }
    })
  );
};
