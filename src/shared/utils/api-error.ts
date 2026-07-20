import { isAxiosError } from 'axios';
import type { ApiError, FieldError } from '../models/api-response';

// ── Helpers de inspección ─────────────────────────────────────────────────────

/** Extracts the backend ApiError payload from an Axios error, or undefined. */
function extractPayload(error: unknown): ApiError | undefined {
  if (isAxiosError<ApiError>(error)) return error.response?.data;
  return undefined;
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Returns the human-readable `message` from the backend ErrorResponseDTO.
 * Falls back to `fallback` for network errors or non-API responses.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return extractPayload(error)?.message ?? fallback;
}

/**
 * Returns the HTTP status code from the response, or undefined.
 */
export function getApiErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

/**
 * Returns true when the error is an API response with the given HTTP status.
 * Useful for 404 "not found" → treat as empty, 409 → conflict message, etc.
 */
export function isApiErrorWithStatus(error: unknown, status: number): boolean {
  return isAxiosError(error) && error.response?.status === status;
}

/**
 * Returns true when the backend included a specific `errorCode`.
 * Use this to distinguish DomainException subtypes without relying on HTTP status alone.
 *
 * @example
 * if (hasApiErrorCode(err, 'EVALUACION_YA_EXISTE')) { ... }
 */
export function hasApiErrorCode(error: unknown, code: string): boolean {
  return extractPayload(error)?.errorCode === code;
}

/**
 * Returns field-level validation errors from a 400 or 422 response, or an empty array.
 * Maps directly to the `fieldErrors` array in `MethodArgumentNotValidException`
 * and `DomainValidationException` backend responses.
 */
export function getApiFieldErrors(error: unknown): FieldError[] {
  return extractPayload(error)?.fieldErrors ?? [];
}

/**
 * Classifies the error into a user-facing category string.
 * Useful for analytics, logging, or rendering different UI variants.
 *
 * Returns:
 * - 'validation'     → HTTP 400 (bad request / field errors)
 * - 'domain'         → HTTP 422 (business rule violation)
 * - 'unauthorized'   → HTTP 401
 * - 'forbidden'      → HTTP 403
 * - 'not-found'      → HTTP 404
 * - 'unavailable'    → HTTP 503 (infrastructure error)
 * - 'server'         → HTTP 500
 * - 'network'        → no response (timeout, offline)
 * - 'unknown'        → anything else
 */
export type ApiErrorCategory =
  | 'validation'
  | 'domain'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'unavailable'
  | 'server'
  | 'network'
  | 'unknown';

export function classifyApiError(error: unknown): ApiErrorCategory {
  if (!isAxiosError(error)) return 'unknown';
  if (!error.response) return 'network';
  switch (error.response.status) {
    case 400: return 'validation';
    case 401: return 'unauthorized';
    case 403: return 'forbidden';
    case 404: return 'not-found';
    case 422: return 'domain';
    case 503: return 'unavailable';
    case 500: return 'server';
    default:  return 'unknown';
  }
}
