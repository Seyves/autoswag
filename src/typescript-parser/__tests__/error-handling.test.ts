import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Error Handling', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/error-cases'

    test('should handle empty file', () => {
        const fileName = `${fixtures}/empty-file.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NonExistent')
        expect(result).toStrictEqual(undefined)
    })

    test('should handle file with only comments', () => {
        const fileName = `${fixtures}/only-comments.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NonExistent')
        expect(result).toStrictEqual(undefined)
    })

    test('should handle syntax errors gracefully', () => {
        // Parser should either throw or return partial results
        const fileName = `${fixtures}/syntax-error.ts`
        expect(() => {
            const program = createProgram([fileName])
            parse(program, {}, fileName, 'Invalid')
        }).not.toThrow()
    })

    test('should handle file with no exports', () => {
        const fileName = `${fixtures}/no-exports.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NonExistent')
        expect(result).toStrictEqual(undefined)
    })

    test('should handle invalid file path', () => {
        const fileName = `${fixtures}/non-existent-file.ts`
        const program = createProgram([fileName])
        expect(() => {
            const result = parse(program, {}, fileName, 'NonExistent')
            expect(result).toStrictEqual(undefined)
        }).toThrow()
    })

    test('should handle circular type references', () => {
        expect(() => {
            const fileName = `${fixtures}/circular-reference.ts`
            const program = createProgram([fileName])
            parse(program, {}, fileName, 'Node')
        }).toThrow('Recursive declaration encountered')
    })

    test('should handle extremely deep nesting', () => {
        const fileName = `${fixtures}/extremely-deep-nesting.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Deep')
        // Should handle deep nesting without stack overflow
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
        })
        // Verify it actually parsed deeply
        expect(result).toHaveProperty('properties.level1')
    })

    test('should handle mixed valid and invalid types', () => {
        const fileName = `${fixtures}/mixed-valid-invalid.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Valid')
        // Should parse valid types even if some are invalid
        expect(result).toBeDefined()
        expect(result.type).toBe(nodes.Kind.Object)
    })
})
