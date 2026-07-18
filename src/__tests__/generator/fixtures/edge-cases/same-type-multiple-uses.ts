/**
 * @component User
 */
interface User {
    id: string
    name: string
}

/**
 * @autodoc GET /users
 * @response {User} 200 List of users
 */

/**
 * @autodoc POST /users
 * @body required User data
 * @accept {User} application/json
 * @response {User} 201 User created
 */

/**
 * @autodoc PUT /users/{id}
 * @pathParam {string} id User ID
 * @body required User data
 * @accept {User} application/json
 * @response {User} 200 User updated
 */

/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User details
 */
