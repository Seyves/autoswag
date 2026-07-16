import { User } from '../users/types'

/**
 * @component Post
 */
export interface Post {
    id: string
    title: string
    content: string
    author: User
}

/**
 * @component CreatePostRequest
 */
export interface CreatePostRequest {
    title: string
    content: string
    authorId: string
}
