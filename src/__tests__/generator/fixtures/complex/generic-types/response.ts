/**
 * @component ApiResponse
 */
export interface ApiResponse<T> {
    success: boolean
    data: T
    timestamp: string
}

/**
 * @component PagedResponse
 */
export interface PagedResponse<T> {
    items: T[]
    total: number
    page: number
}

/**
 * @component User
 */
export interface User {
    id: string
    name: string
}
