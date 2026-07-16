import { User } from './user'

/**
 * @component Post
 */
export interface Post {
    id: string
    title: string
    author: User
}
