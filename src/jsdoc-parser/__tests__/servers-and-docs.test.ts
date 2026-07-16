import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Servers and External Docs', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/servers-and-docs'

    test('should parse single server without description', () => {
        const fileName = `${fixtures}/single-server.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/data': {
                get: {
                    servers: [
                        {
                            url: 'https://api.example.com',
                        },
                    ],
                },
            },
        })
    })

    test('should parse multiple servers with descriptions', () => {
        const fileName = `${fixtures}/multiple-servers.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/data': {
                get: {
                    servers: [
                        {
                            url: 'https://api.example.com',
                            description: 'Production server',
                        },
                        {
                            url: 'https://staging.example.com',
                            description: 'Staging environment',
                        },
                    ],
                },
            },
        })
    })

    test('should parse server without description', () => {
        const fileName = `${fixtures}/server-without-description.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/ping': {
                get: {
                    servers: [
                        {
                            url: 'https://localhost:3000',
                        },
                    ],
                },
            },
        })
    })

    test('should parse externalDocs with description', () => {
        const fileName = `${fixtures}/external-docs.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {
                    externalDocs: {
                        url: 'https://docs.example.com/users',
                        description: 'User documentation',
                    },
                },
            },
        })
    })

    test('should parse externalDocs without description', () => {
        const fileName = `${fixtures}/external-docs-without-description.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/webhook': {
                post: {
                    externalDocs: {
                        url: 'https://docs.example.com/webhooks',
                    },
                },
            },
        })
    })
})
