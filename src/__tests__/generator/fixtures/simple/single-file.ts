/**
 * @component User
 */
interface User {
    id: string
    name: string
    age: number
}

/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 Success
 */
