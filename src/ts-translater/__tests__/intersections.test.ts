import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Intersections', () => {
    const fixtures = 'src/ts-translater/__tests__/fixtures/intersections'

    test('should translate intersection of two object types', () => {
        const [result] = translate(`${fixtures}/intersection-of-two-objects.ts`)
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
        const [result] = translate(`${fixtures}/intersection-of-multiple-objects.ts`)
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
        const [result] = translate(`${fixtures}/intersection-of-object-and-record.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
            },
            required: ['id'],
        })
    })

    test('should handle intersection with primitive', () => {
        const [result] = translate(`${fixtures}/intersection-with-primitive.ts`)
        // Intersection of object and primitive is typically never/unknown
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })

    test('should translate intersection creating merged object', () => {
        const [result] = translate(`${fixtures}/intersection-creating-merged-object.ts`)
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
        const [result] = translate(`${fixtures}/intersection-of-unions.ts`)
        // (string | number) & (number | boolean) = number
        expect(result).toStrictEqual({
            type: nodes.Kind.Number,
        })
    })

    test('should handle intersection with never', () => {
        const [result] = translate(`${fixtures}/intersection-with-never.ts`)
        // Intersection with never results in never (Unknown)
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })

    test('should handle impossible intersection', () => {
        const [result] = translate(`${fixtures}/impossible-intersection.ts`)
        // string & number = never
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })
})
