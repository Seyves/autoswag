import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Unions', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/unions'

    test('should translate union of primitives', () => {
        const fileName = `${fixtures}/union-of-primitives.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringOrNumber')
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
        })
    })

    test('should translate union with null', () => {
        const fileName = `${fixtures}/union-with-null.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NullableString')
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.Null }, { type: nodes.Kind.String }],
        })
    })

    test('should translate union with undefined', () => {
        const fileName = `${fixtures}/union-with-undefined.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'MaybeNumber')
        expect(result).toStrictEqual({
            type: nodes.Kind.Union,
            oneOf: [{ type: nodes.Kind.Undefined }, { type: nodes.Kind.Number }],
        })
    })

    test('should translate union with null and undefined', () => {
        const fileName = `${fixtures}/union-with-null-and-undefined.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Optional')
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
        const fileName = `${fixtures}/union-of-objects.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UserOrAdmin')
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
        const fileName = `${fixtures}/union-of-arrays.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringOrNumberArray')
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
        const fileName = `${fixtures}/discriminated-union.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Result')
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
        const fileName = `${fixtures}/union-with-never.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'WithNever')
        // Union with never should simplify to just the other type
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })

    test('should translate large union', () => {
        const fileName = `${fixtures}/large-union.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'LargeUnion')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'],
        })
    })

    test('should translate nested unions', () => {
        const fileName = `${fixtures}/nested-unions.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NestedUnion')
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
        const fileName = `${fixtures}/union-of-literals-and-primitives.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Mixed')
        // 'specific' | string typically resolves to just string
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })
})
