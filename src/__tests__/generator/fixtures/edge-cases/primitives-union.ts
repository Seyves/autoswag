/**
 * @component User
 */
interface User {
    id: string
    name: number | string
}

/**
 * @autoswag POST /users
 * @response {User} 201 User created
 */
