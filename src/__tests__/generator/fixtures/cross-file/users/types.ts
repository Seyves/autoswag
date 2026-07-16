/**
 * @component User
 */
export interface User {
    id: string
    name: string
    email: string
    profile: UserProfile
}

/**
 * @component UserProfile
 */
export interface UserProfile {
    bio: string
    avatar: string
}

/**
 * @component CreateUserRequest
 */
export interface CreateUserRequest {
    name: string
    email: string
}
