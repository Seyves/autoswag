import { Post, CreatePostRequest } from './types'

/**
 * @autoswag GET /posts
 * @queryParam {string} [authorId] Filter by author
 * @response {Post} 200 List of posts
 */

/**
 * @autoswag POST /posts
 * @body required Post data
 * @accept {CreatePostRequest} application/json
 * @response {Post} 201 Post created
 */
