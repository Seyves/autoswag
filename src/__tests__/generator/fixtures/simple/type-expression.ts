/**
 * @component User
 */
export interface User {
    id: string
    name: string
    age: number
}

/**
 * @autoswag GET /users
 * @response {User[]} 200 Success
 */

/**
 * @autoswag GET /users/map
 * @response {Record<string, User>} 200 Success
 */
