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
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {UserResponse} 200 User data
 */

/**
 * @autodoc GET /users
 * @response {UserListResponse} 200 User list
 */
