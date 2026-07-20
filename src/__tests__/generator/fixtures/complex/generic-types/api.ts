import { ApiResponse, PagedResponse, User } from './response'

// Note: TypeScript parser should resolve ApiResponse<User> to the actual shape
/**
 * @component UserResponse
 */
type UserResponse = ApiResponse<User>

/**
 * @component UserListResponse
 */
type UserListResponse = PagedResponse<User>

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {UserResponse} 200 User data
 */

/**
 * @autoswag GET /users
 * @response {UserListResponse} 200 User list
 */
