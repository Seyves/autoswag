import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Intersections', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/intersections'

    test('should translate intersection of two object types', () => {
        const fileName = `${fixtures}/intersection-of-two-objects.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should translate intersection of multiple object types', () => {
        const fileName = `${fixtures}/intersection-of-multiple-objects.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
            },
            required: ['id', 'name', 'age'],
        })
    })

    test('should translate intersection of object and record', () => {
        const fileName = `${fixtures}/intersection-of-object-and-record.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
            },
            required: ['id'],
        })
    })

    test('should handle intersection with primitive', () => {
        const fileName = `${fixtures}/intersection-with-primitive.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Invalid')
        // Intersection of object and primitive is typically never/unknown
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })

    test('should translate intersection creating merged object', () => {
        const fileName = `${fixtures}/intersection-creating-merged-object.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Merged')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
            },
            required: ['id', 'name', 'age'],
        })
    })

    test('should handle intersection of union types', () => {
        const fileName = `${fixtures}/intersection-of-unions.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Complex')
        // (string | number) & (number | boolean) = number
        expect(result).toStrictEqual({
            type: nodes.Kind.Number,
        })
    })

    test('should handle intersection with never', () => {
        const fileName = `${fixtures}/intersection-with-never.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'WithNever')
        // Intersection with never results in never (Unknown)
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })

    test('should handle impossible intersection', () => {
        const fileName = `${fixtures}/impossible-intersection.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Impossible')
        // string & number = never
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })
})
