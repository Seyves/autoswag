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
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {PublicUser} 200 User data
 */

/**
 * @autoswag POST /users
 * @body required User data
 * @accept {CreateUserRequest} application/json
 * @response {PublicUser} 201 User created
 */

/**
 * @autoswag PATCH /users/{id}
 * @pathParam {string} id User ID
 * @body required User updates
 * @accept {UpdateUserRequest} application/json
 * @response {PublicUser} 200 User updated
 */
