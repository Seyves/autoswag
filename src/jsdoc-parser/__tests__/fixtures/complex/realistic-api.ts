/**
 * @autoswag GET /api/articles
 * @operationId listArticles
 * @summary List all articles with pagination
 * @tag Articles
 * @queryParam {number} [page] Page number
 * @queryParam {number} [limit] Items per page
 * @queryParam {string} [search] Search query
 * @response {ArticleList} 200.application/json Success
 * @response {Error} 400.application/json Bad request
 */

/**
 * @autoswag POST /api/articles
 * @operationId createArticle
 * @summary Create a new article
 * @tag Articles
 * @security OAuth2 write:articles
 * @body required Article data
 * @accept {ref:ArticleInput} application/json
 * @response {Article} 201.application/json Article created
 * @response {ValidationError} 422.application/json Validation failed
 * @deprecated
 */
