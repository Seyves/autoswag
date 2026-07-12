import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Records', () => {
    const fixtures = 'src/translater/__tests__/fixtures/records'

    describe('String-keyed records', () => {
        test('should translate string record with number values', () => {
            const [result] = translate(`${fixtures}/string-record-number.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })

        test('should translate string record with string values', () => {
            const [result] = translate(`${fixtures}/string-record-string.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.String },
            })
        })

        test('should translate string record with object values', () => {
            const [result] = translate(`${fixtures}/string-record-object.ts`)
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
            const [result] = translate(`${fixtures}/string-index-signature.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })
    })

    describe('Number-keyed records', () => {
        test('should translate numeric record with number values', () => {
            const [result] = translate(`${fixtures}/numeric-record-number.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })

        test('should translate numeric record with string values', () => {
            const [result] = translate(`${fixtures}/numeric-record-string.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.String },
            })
        })

        test('should translate numeric record with object values', () => {
            const [result] = translate(`${fixtures}/numeric-record-object.ts`)
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
            const [result] = translate(`${fixtures}/numeric-index-signature.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Number },
            })
        })
    })

    describe('Complex records', () => {
        test('should translate record with union value types', () => {
            const [result] = translate(`${fixtures}/record-with-union-values.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: {
                    type: nodes.Kind.Union,
                    oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                },
            })
        })

        test('should translate record with complex nested types', () => {
            const [result] = translate(`${fixtures}/record-with-complex-nested.ts`)
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
            const [result] = translate(`${fixtures}/empty-record.ts`)
            expect(result).toStrictEqual({
                type: nodes.Kind.Record,
                items: { type: nodes.Kind.Unknown },
            })
        })

        test('should translate partial record', () => {
            const [result] = translate(`${fixtures}/partial-record.ts`)
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
