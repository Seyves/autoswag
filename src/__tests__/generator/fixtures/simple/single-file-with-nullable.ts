/**
 * @component User
 */
interface User {
    id: string
    name: string | null
    age: number
}

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 Success
 */
