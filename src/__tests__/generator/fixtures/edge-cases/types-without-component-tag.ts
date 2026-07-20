// Types WITHOUT @component tag should be INLINED, not extracted to components

interface User {
    id: string
    name: string
}

/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User details
 */
