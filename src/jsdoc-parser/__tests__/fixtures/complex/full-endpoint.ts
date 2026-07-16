/**
 * @autodoc  POST /api/v1/users/{id}/posts
 * @operationId createUserPost
 * @summary Create a new post for user
 * @tag Posts
 * @security BearerAuth read:posts write:posts
 * @server https://api.example.com Production API
 * @externalDocs https://docs.example.com/posts Post documentation
 * @pathParam {string} id User ID
 * @queryParam {boolean} [notify] Send notification
 * @headerParam {string} X-Request-Id Request tracking ID
 * @request required Post data
 * @accept {PostData} application/json
 * @response {Post} 201.application/json Post created successfully
 * @response {Error} 400.application/json Invalid input
 * @response 401 Unauthorized
 */
