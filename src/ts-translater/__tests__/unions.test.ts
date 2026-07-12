import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Unions', () => {
    const fixtures = 'src/ts-translater/__tests__/fixtures/unions'

    test('should translate union of primitives', () => {
        const [result] = translate(`${fixtures}/union-of-primitives.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
        })
    })

    test('should translate union with null', () => {
        const [result] = translate(`${fixtures}/union-with-null.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.Null }, { type: nodes.Kind.String }],
        })
    })

    test('should translate union with undefined', () => {
        const [result] = translate(`${fixtures}/union-with-undefined.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.Undefined }, { type: nodes.Kind.Number }],
        })
    })

    test('should translate union with null and undefined', () => {
        const [result] = translate(`${fixtures}/union-with-null-and-undefined.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [
                { type: nodes.Kind.Undefined },
                { type: nodes.Kind.Null },
                { type: nodes.Kind.String },
            ],
        })
    })

    test('should translate union of object types', () => {
        const [result] = translate(`${fixtures}/union-of-objects.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [
                {
                    type: nodes.Kind.Object,
                    properties: {
                        type: { type: nodes.Kind.Enum, values: ['user'] },
                        name: { type: nodes.Kind.String },
                    },
                    required: ['type', 'name'],
                },
                {
                    type: nodes.Kind.Object,
                    properties: {
                        type: { type: nodes.Kind.Enum, values: ['admin'] },
                        permissions: {
                            type: nodes.Kind.Array,
                            items: { type: nodes.Kind.String },
                        },
                    },
                    required: ['type', 'permissions'],
                },
            ],
        })
    })

    test('should translate union of arrays', () => {
        const [result] = translate(`${fixtures}/union-of-arrays.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [
                {
                    type: nodes.Kind.Array,
                    items: { type: nodes.Kind.String },
                },
                {
                    type: nodes.Kind.Array,
                    items: { type: nodes.Kind.Number },
                },
            ],
        })
    })

    test('should translate discriminated union', () => {
        const [result] = translate(`${fixtures}/discriminated-union.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [
                {
                    type: nodes.Kind.Object,
                    properties: {
                        status: { type: nodes.Kind.Enum, values: ['success'] },
                        data: { type: nodes.Kind.String },
                    },
                    required: ['status', 'data'],
                },
                {
                    type: nodes.Kind.Object,
                    properties: {
                        status: { type: nodes.Kind.Enum, values: ['error'] },
                        message: { type: nodes.Kind.String },
                    },
                    required: ['status', 'message'],
                },
            ],
        })
    })

    test('should translate union with never', () => {
        const [result] = translate(`${fixtures}/union-with-never.ts`)
        // Union with never should simplify to just the other type
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })

    test('should translate large union', () => {
        const [result] = translate(`${fixtures}/large-union.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'],
        })
    })

    test('should translate nested unions', () => {
        const [result] = translate(`${fixtures}/nested-unions.ts`)
        // Nested unions flatten
        expect(result).toMatchObject({
            type: nodes.Kind.Union,
            oneOf: expect.arrayContaining([
                { type: nodes.Kind.String },
                { type: nodes.Kind.Number },
                { type: nodes.Kind.Boolean },
                { type: nodes.Kind.Null },
            ]),
        })
    })

    test('should translate union of literals and primitives', () => {
        const [result] = translate(`${fixtures}/union-of-literals-and-primitives.ts`)
        // 'specific' | string typically resolves to just string
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })
})
