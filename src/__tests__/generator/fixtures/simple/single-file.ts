/**
 * @component User
 */
export interface User {
    id: string
    name: string
    age: number
}

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 Success
 */
