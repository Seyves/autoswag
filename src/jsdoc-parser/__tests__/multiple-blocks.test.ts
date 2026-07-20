import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Multiple Blocks', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/multiple-blocks'

    test('should parse multiple autoswag blocks in single file', () => {
        const fileName = `${fixtures}/multiple-endpoints.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {},
                post: {},
            },
            '/users/{id}': {
                delete: {},
            },
        })
    })

    test('should skip blocks without @autoswag tag', () => {
        const fileName = `${fixtures}/mixed-with-regular-comments.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/users': {
                get: {},
            },
        })
    })

    test('should handle same path with different methods', () => {
        const fileName = `${fixtures}/same-path-different-methods.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource': {
                get: {},
                post: {},
                put: {},
                delete: {},
            },
        })
    })

    test('should organize by path then method', () => {
        const fileName = `${fixtures}/multiple-endpoints.ts`
        const result = parsePaths(fileName)

        // Verify structure: paths -> methods -> request
        expect(result).toHaveProperty('/users')
        expect(result['/users']).toHaveProperty('get')
        expect(result['/users']).toHaveProperty('post')
        expect(result).toHaveProperty('/users/{id}')
        expect(result['/users/{id}']).toHaveProperty('delete')

        // Each method should have a request object
        expect(typeof result['/users']!.get).toBe('object')
        expect(typeof result['/users']!.post).toBe('object')
        expect(typeof result['/users/{id}']!.delete).toBe('object')
    })
})
