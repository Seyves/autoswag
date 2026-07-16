/**
 * @component User
 */
interface User {
    id: string
    name: string
}

// This type has NO @component tag, should be inlined
interface BasicResponse {
    success: boolean
    message: string
}

/**
 * @autodoc POST /users
 * @request required User data
 * @accept {User} application/json
 * @response {User} 201 User created
 * @response {BasicResponse} 400 Error response (will be inlined)
 */
