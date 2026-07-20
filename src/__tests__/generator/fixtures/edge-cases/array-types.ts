/**
 * @component User
 */
interface User {
    id: string
    name: string
}

/**
 * @component UserList
 */
type UserList = User[]

/**
 * @autoswag GET /users
 * @response {UserList} 200 List of users
 */
