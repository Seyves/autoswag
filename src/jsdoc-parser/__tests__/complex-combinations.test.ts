import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Complex Combinations', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/complex'

    test('should parse endpoint with all tags combined', () => {
        const fileName = `${fixtures}/full-endpoint.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/api/v1/users/{id}/posts': {
                post: {
                    operationId: 'createUserPost',
                    summary: 'Create a new post for user',
                    tags: ['Posts'],
                    security: [
                        {
                            BearerAuth: ['read:posts', 'write:posts'],
                        },
                    ],
                    servers: [
                        {
                            url: 'https://api.example.com',
                            description: 'Production API',
                        },
                    ],
                    externalDocs: {
                        url: 'https://docs.example.com/posts',
                        description: 'Post documentation',
                    },
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            description: 'User ID',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                            },
                        },
                        {
                            in: 'query',
                            name: 'notify',
                            required: false,
                            description: 'Send notification',
                            schema: {
                                $tsType: 'boolean',
                                $fileName: fileName,
                            },
                        },
                        {
                            in: 'header',
                            name: 'X-Request-Id',
                            required: true,
                            description: 'Request tracking ID',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                            },
                        },
                    ],
                    requestBody: {
                        required: true,
                        description: 'Post data',
                        content: {
                            'application/json': {
                                $tsType: 'PostData',
                                $fileName: fileName,
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'Post created successfully',
                            content: {
                                'application/json': {
                                    $tsType: 'Post',
                                    $fileName: fileName,
                                },
                            },
                        },
                        400: {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    $tsType: 'Error',
                                    $fileName: fileName,
                                },
                            },
                        },
                        401: {
                            description: 'Unauthorized',
                        },
                    },
                },
            },
        })
    })

    test('should parse realistic REST API with multiple endpoints', () => {
        const fileName = `${fixtures}/realistic-api.ts`
        const result = parsePaths(fileName)
        
        // Test first endpoint
        expect(result['/api/articles']!.get).toMatchObject({
            operationId: 'listArticles',
            summary: 'List all articles with pagination',
            tags: ['Articles'],
        })
        
        expect(result['/api/articles']!.get.parameters).toHaveLength(3)
        expect(result['/api/articles']!.get.responses).toHaveProperty('200')
        expect(result['/api/articles']!.get.responses).toHaveProperty('400')
        
        // Test second endpoint
        expect(result['/api/articles']!.post).toMatchObject({
            operationId: 'createArticle',
            summary: 'Create a new article',
            tags: ['Articles'],
            deprecated: true,
        })
        
        expect(result['/api/articles']!.post.security).toBeDefined()
        expect(result['/api/articles']!.post.requestBody).toBeDefined()
        expect(result['/api/articles']!.post.requestBody!.required).toBe(true)
        expect(result['/api/articles']!.post.responses).toHaveProperty('201')
        expect(result['/api/articles']!.post.responses).toHaveProperty('422')
    })

    test('should handle request body with content types', () => {
        const fileName = `${fixtures}/full-endpoint.ts`
        const result = parsePaths(fileName)
        
        const requestBody = result['/api/v1/users/{id}/posts']!.post.requestBody
        expect(requestBody).toBeDefined()
        expect(requestBody!.required).toBe(true)
        expect(requestBody!.description).toBe('Post data')
        expect(requestBody!.content).toHaveProperty('application/json')
    })

    test('should handle responses with and without content', () => {
        const fileName = `${fixtures}/full-endpoint.ts`
        const result = parsePaths(fileName)
        
        const responses = result['/api/v1/users/{id}/posts']!.post.responses!
        
        // Response with content
        expect(responses[201]).toHaveProperty('content')
        expect(responses[201]!.content).toHaveProperty('application/json')
        
        // Response without content
        expect(responses[401]).not.toHaveProperty('content')
        expect(responses[401]!.description).toBe('Unauthorized')
    })
})
