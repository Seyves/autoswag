import { User } from './user'
import { Post } from './post'

/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User with posts
 */

/**
 * @autodoc GET /posts/{id}
 * @pathParam {string} id Post ID
 * @response {Post} 200 Post with author
 */
