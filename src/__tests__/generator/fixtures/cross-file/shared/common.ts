/**
 * @component PaginationParams
 */
export interface PaginationParams {
    page: number
    limit: number
}

/**
 * @component ApiResponse
 */
export interface ApiResponse<T> {
    data: T
    meta: {
        total: number
        page: number
    }
}

/**
 * @component ErrorResponse
 */
export interface ErrorResponse {
    error: string
    code: number
}
