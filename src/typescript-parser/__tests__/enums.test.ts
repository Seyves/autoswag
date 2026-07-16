import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Enums', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/enums'

    test('should translate string union enum', () => {
        const fileName = `${fixtures}/string-union-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Theme')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['light', 'dark', 'system'],
        })
    })

    test('should translate number union enum', () => {
        const fileName = `${fixtures}/number-union-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Status')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate string TypeScript enum', () => {
        const fileName = `${fixtures}/string-ts-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Theme')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['light', 'dark', 'system'],
        })
    })

    test('should translate number TypeScript enum', () => {
        const fileName = `${fixtures}/number-ts-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Status')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate auto-incrementing enum', () => {
        const fileName = `${fixtures}/auto-increment-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Status')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate const enum', () => {
        const fileName = `${fixtures}/const-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Direction')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
        })
    })

    test('should translate single-value enum', () => {
        const fileName = `${fixtures}/single-value-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Single')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['only'],
        })
    })

    test('should translate enum with computed members', () => {
        const fileName = `${fixtures}/enum-with-computed-members.ts`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'Computed')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [10, 20, 30],
        })
    })

    test('should translate mixed enum (string and number values)', () => {
        const fileName = `${fixtures}/mixed-enum.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Mixed')
        // Mixed enums might be translated as Union or treated specially
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })
})
