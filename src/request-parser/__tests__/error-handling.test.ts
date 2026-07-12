import { expect, test, describe } from 'vitest'
import { getPathsFromFile } from '../request-parser'

describe('Error Handling', () => {
    const fixtures = 'src/request-parser/__tests__/fixtures/error-cases'

    test('should throw on invalid method', () => {
        expect(() => getPathsFromFile(`${fixtures}/invalid-method.ts`)).toThrow(
            '@autodoc tag contains invalid request method: "MET"',
        )
    })

    test('should throw on no path', () => {
        expect(() => getPathsFromFile(`${fixtures}/no-path.ts`)).toThrow(
            '@autodoc tag has no path specified',
        )
    })

    test('should throw on request without no accepts', () => {
        expect(() => getPathsFromFile(`${fixtures}/request-without-accepts.ts`)).toThrow(
            '@request tag cannot be specified without @accept tags',
        )
    })

    test('should throw on request with invalid name', () => {
        expect(() => getPathsFromFile(`${fixtures}/request-invalid-name.ts`)).toThrow(
            `@request tag should contain "optional" or "required" right after declaration`,
        )
    })

    test('should throw on response without name', () => {
        expect(() => getPathsFromFile(`${fixtures}/response-without-name.ts`)).toThrow(
            `@response tag should contain expression <httpCode> or <httpCode>.<contentType> right after declaration`,
        )
    })

    test('should throw on response with invalid name', () => {
        expect(() => getPathsFromFile(`${fixtures}/response-invalid-name.ts`)).toThrow(
            `@response tag should contain expression <httpCode> or <httpCode>.<contentType> right after declaration`,
        )
    })

    test('should throw on response without description', () => {
        expect(() => getPathsFromFile(`${fixtures}/response-without-description.ts`)).toThrow(
            `@response tag should contain description`,
        )
    })

    test('should throw on invalid type reference', () => {
        expect(() => getPathsFromFile(`${fixtures}/invalid-type-reference.ts`)).toThrow(
            `@pathParam tag contains invalid type reference: "invalid type"`,
        )
    })
})
