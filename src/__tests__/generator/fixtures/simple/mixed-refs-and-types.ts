/**
 * @component User
 */
interface User {
    id: string
    name: string
}

/**
 * @autodoc POST /users
 * @body required User data
 * @accept {User} application/json
 * @accept {ref:LegacyUserFormat} application/xml
 * @response {User} 201 User created
 * @response {string} 400 Validation error
 */
