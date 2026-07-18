/**
 * @component User
 */
interface User {
    id: string
    name: number | string
}

/**
 * @autodoc POST /users
 * @response {User} 201 User created
 */
