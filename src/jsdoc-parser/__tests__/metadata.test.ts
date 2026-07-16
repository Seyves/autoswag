import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Metadata', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/metadata'

    test('should parse operationId', () => {
        const fileName = `${fixtures}/operation-id.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {
                    operationId: 'getUserList',
                },
            },
        })
    })

    test('should parse deprecated flag', () => {
        const fileName = `${fixtures}/deprecated.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/old-endpoint': {
                get: {
                    deprecated: true,
                },
            },
        })
    })

    test('should parse summary', () => {
        const fileName = `${fixtures}/summary.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                post: {
                    summary: 'Create a new user in the system',
                },
            },
        })
    })

    test('should parse tag', () => {
        const fileName = `${fixtures}/tags.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {
                    tags: ['Users'],
                },
            },
        })
    })

    test('should parse combined metadata tags', () => {
        const fileName = `${fixtures}/combined-metadata.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users/{id}': {
                delete: {
                    operationId: 'deleteUser',
                    summary: 'Delete user account',
                    tags: ['Users'],
                    deprecated: true,
                },
            },
        })
    })
})
