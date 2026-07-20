import { PaginationParams, ErrorResponse } from './common'
import { User } from '../users/types'

/**
 * @autoswag GET /search/users
 * @queryParam {number} page Page number
 * @queryParam {number} limit Items per page
 * @response {User} 200 Search results
 * @response {ErrorResponse} 400 Bad request
 */
