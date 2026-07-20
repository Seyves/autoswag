import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Parameters', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/parameters'

    test('should parse path parameters', () => {
        const fileName = `${fixtures}/path-params.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users/{id}': {
                get: {
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            description: 'User ID',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 16],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse query parameters', () => {
        const fileName = `${fixtures}/query-params.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {
                    parameters: [
                        {
                            in: 'query',
                            name: 'name',
                            required: true,
                            description: 'Filter by name',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 17],
                            },
                        },
                        {
                            in: 'query',
                            name: 'age',
                            required: false,
                            description: 'Filter by age',
                            schema: {
                                $tsType: 'number',
                                $fileName: fileName,
                                $position: [4, 17],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse header parameters', () => {
        const fileName = `${fixtures}/header-params.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/data': {
                get: {
                    parameters: [
                        {
                            in: 'header',
                            name: 'X-API-Key',
                            required: true,
                            description: 'API Key',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 18],
                            },
                        },
                        {
                            in: 'header',
                            name: 'X-Request-Id',
                            required: false,
                            description: 'Request ID',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [4, 18],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse cookie parameters', () => {
        const fileName = `${fixtures}/cookie-params.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/profile': {
                get: {
                    parameters: [
                        {
                            in: 'cookie',
                            name: 'session',
                            required: true,
                            description: 'Session token',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 18],
                            },
                        },
                        {
                            in: 'cookie',
                            name: 'preferences',
                            required: false,
                            description: 'User preferences',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [4, 18],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse parameters with ref types', () => {
        const fileName = `${fixtures}/params-with-ref.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/items/{id}': {
                get: {
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            description: 'Item UUID',
                            schema: {
                                $ref: '#/components/schemas/UUID',
                            },
                        },
                        {
                            in: 'query',
                            name: 'filter',
                            required: true,
                            description: 'Filter options',
                            schema: {
                                $ref: '#/components/schemas/FilterOptions',
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse parameters without description', () => {
        const fileName = `${fixtures}/params-without-description.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/search': {
                get: {
                    parameters: [
                        {
                            in: 'query',
                            name: 'q',
                            required: true,
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 17],
                            },
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            required: false,
                            schema: {
                                $tsType: 'number',
                                $fileName: fileName,
                                $position: [4, 17],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should parse mixed parameter types', () => {
        const fileName = `${fixtures}/mixed-params.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/articles/{id}/comments': {
                post: {
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            description: 'Article ID',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [3, 16],
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
                                $position: [4, 17],
                            },
                        },
                        {
                            in: 'header',
                            name: 'Authorization',
                            required: true,
                            description: 'Bearer token',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [5, 18],
                            },
                        },
                        {
                            in: 'cookie',
                            name: 'session',
                            required: false,
                            description: 'Session cookie',
                            schema: {
                                $tsType: 'string',
                                $fileName: fileName,
                                $position: [6, 18],
                            },
                        },
                    ],
                },
            },
        })
    })

    test('should always mark path parameters as required', () => {
        const fileName = `${fixtures}/path-params.ts`
        const result = parsePaths(fileName)
        expect(result['/users/{id}']!.get.parameters![0]!.required).toBe(true)
    })
})
