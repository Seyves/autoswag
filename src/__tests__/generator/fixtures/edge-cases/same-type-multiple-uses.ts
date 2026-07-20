/**
 * @component User
 */
interface User {
    id: string
    name: string
}

/**
 * @autoswag GET /users
 * @response {User} 200 List of users
 */

/**
 * @autoswag POST /users
 * @body required User data
 * @accept {User} application/json
 * @response {User} 201 User created
 */

/**
 * @autoswag PUT /users/{id}
 * @pathParam {string} id User ID
 * @body required User data
 * @accept {User} application/json
 * @response {User} 200 User updated
 */

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User details
 */
