import { User, CreateUserRequest } from './types'

/**
 * @autodoc GET /users
 * @response {User} 200 List of users
 */

/**
 * @autodoc POST /users
 * @body required User data
 * @accept {CreateUserRequest} application/json
 * @response {User} 201 User created
 */

/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User details
 */
