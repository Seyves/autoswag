/**
 * @component SuccessResponse
 */
interface SuccessResponse {
    status: 'success'
    data: string
}

/**
 * @component ErrorResponse
 */
interface ErrorResponse {
    status: 'error'
    message: string
}

/**
 * @component ApiResponse
 */
type ApiResponse = SuccessResponse | ErrorResponse

/**
 * @autoswag POST /action
 * @response {ApiResponse} 200 Action result
 */
