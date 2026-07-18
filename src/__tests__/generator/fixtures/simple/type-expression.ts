/**
 * @component User
 */
export interface User {
    id: string
    name: string
    age: number
}

/**
 * @autodoc GET /users
 * @response {User[]} 200 Success
 */

/**
 * @autodoc GET /users/map
 * @response {Record<string, User>} 200 Success
 */
