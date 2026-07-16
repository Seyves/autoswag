import { Post, CreatePostRequest } from './types'

/**
 * @autodoc GET /posts
 * @queryParam {string} [authorId] Filter by author
 * @response {Post} 200 List of posts
 */

/**
 * @autodoc POST /posts
 * @request required Post data
 * @accept {CreatePostRequest} application/json
 * @response {Post} 201 Post created
 */
