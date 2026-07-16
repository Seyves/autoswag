import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('HTTP Methods', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/http-methods'

    test('should parse GET method', () => {
        const fileName = `${fixtures}/get.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource': {
                get: {},
            },
        })
    })

    test('should parse DELETE method', () => {
        const fileName = `${fixtures}/delete.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource/{id}': {
                delete: {},
            },
        })
    })

    test('should parse PATCH method', () => {
        const fileName = `${fixtures}/patch.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource/{id}': {
                patch: {},
            },
        })
    })

    test('should parse HEAD method', () => {
        const fileName = `${fixtures}/head.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource': {
                head: {},
            },
        })
    })

    test('should parse OPTIONS method', () => {
        const fileName = `${fixtures}/options.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/resource': {
                options: {},
            },
        })
    })

    test('should parse TRACE method', () => {
        const fileName = `${fixtures}/trace.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/debug': {
                trace: {},
            },
        })
    })

    test('should lowercase HTTP method in output', () => {
        const fileName = `${fixtures}/get.ts`
        const result = parsePaths(fileName)
        const methods = Object.keys(result['/resource']!)
        expect(methods).toContain('get')
        expect(methods).not.toContain('GET')
    })
})
