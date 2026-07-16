import { User } from './base'

/**
 * @component PublicUser
 */
type PublicUser = Omit<User, 'password'>

/**
 * @component CreateUserRequest
 */
type CreateUserRequest = Pick<User, 'name' | 'email' | 'password'>

/**
 * @component UpdateUserRequest
 */
type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>

/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {PublicUser} 200 User data
 */

/**
 * @autodoc POST /users
 * @request required User data
 * @accept {CreateUserRequest} application/json
 * @response {PublicUser} 201 User created
 */

/**
 * @autodoc PATCH /users/{id}
 * @pathParam {string} id User ID
 * @request required User updates
 * @accept {UpdateUserRequest} application/json
 * @response {PublicUser} 200 User updated
 */
