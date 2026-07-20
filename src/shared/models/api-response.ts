/** Generic paginated API response wrapper */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/** Generic single-item API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/** Individual field validation error, present in 400 (MethodArgumentNotValidException) and 422 (DomainValidationException) responses. */
export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: string;
}

/** Matches the backend ErrorResponseDTO structure. */
export interface ApiError {
  error: string;
  errorCode?: string;
  message: string;
  status: number;
  path?: string;
  timestamp?: string;
  fieldErrors?: FieldError[] | null;
}
