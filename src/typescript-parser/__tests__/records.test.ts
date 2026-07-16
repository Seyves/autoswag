import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Records', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/records'

    describe('String-keyed records', () => {
        test('should translate string record with number values', () => {
            const fileName = `${fixtures}/string-record-number.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'NumberRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })

        test('should translate string record with string values', () => {
            const fileName = `${fixtures}/string-record-string.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'StringRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.String },
            })
        })

        test('should translate string record with object values', () => {
            const fileName = `${fixtures}/string-record-object.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'ObjectRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Object,
                    properties: {
                        property: { type: nodes.Kind.Number },
                    },
                    required: ['property'],
                },
            })
        })

        test('should translate string index signature as Record', () => {
            const fileName = `${fixtures}/string-index-signature.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'MappedInterface')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })
    })

    describe('Number-keyed records', () => {
        test('should translate numeric record with number values', () => {
            const fileName = `${fixtures}/numeric-record-number.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'NumberRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })

        test('should translate numeric record with string values', () => {
            const fileName = `${fixtures}/numeric-record-string.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'StringRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.String },
            })
        })

        test('should translate numeric record with object values', () => {
            const fileName = `${fixtures}/numeric-record-object.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'ObjectRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Object,
                    properties: {
                        property: { type: nodes.Kind.Number },
                    },
                    required: ['property'],
                },
            })
        })

        test('should translate numeric index signature as Record', () => {
            const fileName = `${fixtures}/numeric-index-signature.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'MappedInterface')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })
    })

    describe('Complex records', () => {
        test('should translate record with union value types', () => {
            const fileName = `${fixtures}/record-with-union-values.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'UnionRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Union,
                    oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                },
            })
        })

        test('should translate record with complex nested types', () => {
            const fileName = `${fixtures}/record-with-complex-nested.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'NestedRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Object,
                    properties: {
                        id: { type: nodes.Kind.String },
                        data: {
                            type: nodes.Kind.Object,
                            properties: {
                                value: { type: nodes.Kind.Number },
                                items: {
                                    type: nodes.Kind.Array,
                                    items: { type: nodes.Kind.String },
                                },
                            },
                            required: ['value', 'items'],
                        },
                    },
                    required: ['id', 'data'],
                },
            })
        })

        test('should translate empty record', () => {
            const fileName = `${fixtures}/empty-record.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'EmptyRecord')
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Unknown },
            })
        })

        test('should translate partial record', () => {
            const fileName = `${fixtures}/partial-record.ts`
            const program = createProgram([fileName])
            const result = parse(program, {}, fileName, 'PartialRecord')
            // TS converts Partial record keys to `number | undefined`,
            // so its pretty fair to make union from it.
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Union,
                    oneOf: [
                        {
                            type: nodes.Kind.Undefined,
                        },
                        {
                            type: nodes.Kind.Number,
                        },
                    ],
                },
            })
        })
    })
})
