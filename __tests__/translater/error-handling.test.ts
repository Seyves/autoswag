import { expect, test, describe } from 'vitest'
import * as nodes from '../../src/translater/nodes'
import { translate } from '../../src/translater/translate'

describe('Error Handling', () => {
    const fixtures = '__tests__/translater/fixtures/error-cases'

    test('should handle empty file', () => {
        const result = translate(`${fixtures}/empty-file.ts`)
        expect(result).toEqual([])
    })

    test('should handle file with only comments', () => {
        const result = translate(`${fixtures}/only-comments.ts`)
        expect(result).toEqual([])
    })

    test('should handle syntax errors gracefully', () => {
        // Parser should either throw or return partial results
        expect(() => {
            translate(`${fixtures}/syntax-error.ts`)
        }).not.toThrow()
    })

    test('should handle file with no exports', () => {
        const result = translate(`${fixtures}/no-exports.ts`)
        // File with no exports should return empty or handle gracefully
        expect(Array.isArray(result)).toBe(true)
    })

    test('should handle invalid file path', () => {
        expect(() => {
            translate(`${fixtures}/non-existent-file.ts`)
        }).toThrow()
    })

    test('should handle circular type references', () => {
        expect(() => {
            translate(`${fixtures}/circular-reference.ts`)
        }).toThrow('Recursive declaration encountered')
    })

    test('should handle extremely deep nesting', () => {
        const [result] = translate(`${fixtures}/extremely-deep-nesting.ts`)
        // Should handle deep nesting without stack overflow
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
        })
        // Verify it actually parsed deeply
        expect(result).toHaveProperty('properties.level1')
    })

    test('should handle mixed valid and invalid types', () => {
        const results = translate(`${fixtures}/mixed-valid-invalid.ts`)
        // Should parse valid types even if some are invalid
        expect(results.length).toBeGreaterThanOrEqual(1)
        const validType = results.find((r) => r.type === nodes.Kind.Object)
        expect(validType).toBeDefined()
    })
})
