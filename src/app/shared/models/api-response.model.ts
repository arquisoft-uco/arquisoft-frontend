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

/** Generic API error shape */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
}
