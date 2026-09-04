// Refleja el PageResponseDTO del backend.
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
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
