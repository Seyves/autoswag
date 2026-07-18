import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Error Handling', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/error-cases'

    test('should throw on invalid method', () => {
        expect(() => parsePaths(`${fixtures}/invalid-method.ts`)).toThrow(
            '@autodoc tag contains invalid request method: "MET"',
        )
    })

    test('should throw on no path', () => {
        expect(() => parsePaths(`${fixtures}/no-path.ts`)).toThrow(
            '@autodoc tag has no path specified',
        )
    })

    test('should throw on request without no accepts', () => {
        expect(() => parsePaths(`${fixtures}/body-without-accepts.ts`)).toThrow(
            '@body tag cannot be specified without @accept tags',
        )
    })

    test('should throw on request with invalid name', () => {
        expect(() => parsePaths(`${fixtures}/body-invalid-name.ts`)).toThrow(
            `@body tag should contain "optional" or "required" right after declaration`,
        )
    })

    test('should throw on response without name', () => {
        expect(() => parsePaths(`${fixtures}/response-without-name.ts`)).toThrow(
            `@response tag should contain expression <httpCode> or <httpCode>.<contentType> right after declaration`,
        )
    })

    test('should throw on response with invalid name', () => {
        expect(() => parsePaths(`${fixtures}/response-invalid-name.ts`)).toThrow(
            `@response tag should contain expression <httpCode> or <httpCode>.<contentType> right after declaration`,
        )
    })

    test('should throw on response without description', () => {
        expect(() => parsePaths(`${fixtures}/response-without-description.ts`)).toThrow(
            `@response tag should contain description`,
        )
    })
})
