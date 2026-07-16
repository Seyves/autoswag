import { Post } from './post'

/**
 * @component User
 */
export interface User {
    id: string
    name: string
    posts: Post[]
}
