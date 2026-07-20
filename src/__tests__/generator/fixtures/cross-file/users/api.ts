import { User, CreateUserRequest } from './types'

/**
 * @autoswag GET /users
 * @response {User} 200 List of users
 */

/**
 * @autoswag POST /users
 * @body required User data
 * @accept {CreateUserRequest} application/json
 * @response {User} 201 User created
 */

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User details
 */
