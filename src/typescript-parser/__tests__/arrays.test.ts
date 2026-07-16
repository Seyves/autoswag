import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Arrays', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/arrays'

    test('should translate string array type', () => {
        const fileName = `${fixtures}/string-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.String },
        })
    })

    test('should translate number array type', () => {
        const fileName = `${fixtures}/number-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NumberArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should translate generic array type', () => {
        const fileName = `${fixtures}/generic-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'GenericArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Boolean },
        })
    })

    test('should translate readonly array type', () => {
        const fileName = `${fixtures}/readonly-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ReadonlyArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.String },
        })
    })

    test('should translate object array type', () => {
        const fileName = `${fixtures}/object-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ObjectArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Object,
                required: ['id'],
                properties: {
                    id: { type: nodes.Kind.String },
                },
            },
        })
    })

    test('should translate nested array type', () => {
        const fileName = `${fixtures}/nested-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NestedArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Array,
                items: { type: nodes.Kind.Number },
            },
        })
    })

    test('should translate recursive array type', () => {
        const fileName = `${fixtures}/recursive-array.ts`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'TreeNode')
        expect(components).toStrictEqual({
            TreeNode: {
                type: nodes.Kind.Object,
                properties: {
                    value: {
                        type: nodes.Kind.String,
                    },
                    children: {
                        type: nodes.Kind.Array,
                        items: {
                            type: nodes.Kind.Component,
                            ref: 'TreeNode',
                        },
                    },
                },
                required: ['value'],
            },
        })
        expect(result).toStrictEqual({
            type: nodes.Kind.Component,
            ref: 'TreeNode',
        })
    })

    test('should translate tuple type', () => {
        const fileName = `${fixtures}/tuple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Tuple')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [
                { type: nodes.Kind.Number },
                { type: nodes.Kind.String },
                {
                    type: nodes.Kind.Object,
                    properties: {
                        property: { type: nodes.Kind.Boolean },
                    },
                    required: ['property'],
                },
            ],
            minItems: 3,
            maxItems: 3,
        })
    })

    test('should translate empty tuple type', () => {
        const fileName = `${fixtures}/empty-tuple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'EmptyTuple')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [],
            minItems: 0,
            maxItems: 0,
        })
    })

    test('should translate single element tuple type', () => {
        const fileName = `${fixtures}/single-element-tuple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'SingleElementTuple')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }],
            minItems: 1,
            maxItems: 1,
        })
    })

    test('should translate tuple with optional elements', () => {
        const fileName = `${fixtures}/tuple-with-optional.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'TupleWithOptional')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            minItems: 1,
            maxItems: 2,
        })
    })

    test('should translate tuple with rest elements', () => {
        const fileName = `${fixtures}/tuple-with-rest.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'TupleWithRest')
        // Note: rest elements are typically handled as tuples in TS
        expect(result).toMatchObject({
            type: nodes.Kind.Tuple,
        })
    })

    test('should translate readonly tuple type', () => {
        const fileName = `${fixtures}/readonly-tuple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ReadonlyTuple')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            minItems: 2,
            maxItems: 2,
        })
    })

    test('should translate nested tuple type', () => {
        const fileName = `${fixtures}/nested-tuple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NestedTuple')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            minItems: 2,
            maxItems: 2,
            items: [
                {
                    type: nodes.Kind.Tuple,
                    items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                    minItems: 2,
                    maxItems: 2,
                },
                {
                    type: nodes.Kind.Tuple,
                    items: [{ type: nodes.Kind.Boolean }, { type: nodes.Kind.Null }],
                    minItems: 2,
                    maxItems: 2,
                },
            ],
        })
    })

    test('should translate tuple with union', () => {
        const fileName = `${fixtures}/tuple-with-union.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'TupleWithUnion')
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            minItems: 2,
            maxItems: 2,
            items: [
                {
                    type: nodes.Kind.Number,
                },
                {
                    type: nodes.Kind.Union,
                    oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                },
            ],
        })
    })

    test('should translate array of union types', () => {
        const fileName = `${fixtures}/array-of-unions.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ArrayOfUnions')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Union,
                oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            },
        })
    })

    test('should translate deeply nested array type', () => {
        const fileName = `${fixtures}/deeply-nested-array.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'DeeplyNestedArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Array,
                items: {
                    type: nodes.Kind.Array,
                    items: {
                        type: nodes.Kind.Array,
                        items: {
                            type: nodes.Kind.Array,
                            items: { type: nodes.Kind.String },
                        },
                    },
                },
            },
        })
    })
})
