import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Type Aliases', () => {
    const fixtures = 'src/ts-translater/__tests__/fixtures/type-aliases'

    test('should parse type with primitives', () => {
        const [result] = translate(`${fixtures}/type-with-primitives.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
                emailVerified: { type: nodes.Kind.Boolean },
            },
            required: ['id', 'name', 'age'],
        })
    })

    test('should parse type with boolean union', () => {
        const [result] = translate(`${fixtures}/type-with-boolean-union.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                unionBoolA: { type: nodes.Kind.Boolean },
                unionBoolB: { type: nodes.Kind.Boolean },
                unionBoolC: { type: nodes.Kind.Boolean },
            },
            required: [],
        })
    })

    test('should parse nested type', () => {
        const [result] = translate(`${fixtures}/nested-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
                preferences: {
                    type: nodes.Kind.Object,
                    properties: {
                        fontSize: { type: nodes.Kind.Number },
                        theme: { type: nodes.Kind.String },
                    },
                    required: ['fontSize', 'theme'],
                },
            },
            required: ['id', 'name', 'age', 'preferences'],
        })
    })

    test('should parse type with optional properties', () => {
        const [result] = translate(`${fixtures}/type-with-optional-properties.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                required: { type: nodes.Kind.String },
                optional: { type: nodes.Kind.Number },
                alsoOptional: { type: nodes.Kind.Boolean },
            },
            required: ['required'],
        })
    })

    test('should parse type with readonly properties', () => {
        const [result] = translate(`${fixtures}/type-with-readonly-properties.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                createdAt: { type: nodes.Kind.Number },
                updatedAt: { type: nodes.Kind.Number },
            },
            required: ['id', 'createdAt', 'updatedAt'],
        })
    })

    test('should parse empty type', () => {
        const [result] = translate(`${fixtures}/empty-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {},
            required: [],
        })
    })

    test('should parse type with computed property names', () => {
        const [result] = translate(`${fixtures}/type-with-computed-property.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                dynamicKey: {
                    type: 2,
                },
                normalProp: {
                    type: 3,
                },
            },
            required: ['normalProp', 'dynamicKey'],
        })
    })

    test('should parse recursive type', () => {
        const [result] = translate(`${fixtures}/recursive-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.String },
                next: {
                    type: nodes.Kind.Component,
                    ref: 'List',
                },
            },
            required: ['value'],
        })
    })

    test('should parse double recursive type', () => {
        const [result] = translate(`${fixtures}/double-recursive-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.String },
                next: {
                    type: nodes.Kind.Object,
                    properties: {
                        value: { type: nodes.Kind.String },
                        children: {
                            type: nodes.Kind.Array,
                            items: {
                                type: nodes.Kind.Component,
                                ref: 'List',
                            },
                        },
                    },
                    required: ['value'],
                },
            },
            required: ['value'],
        })
    })

    test('should parse conditional type as Unknown', () => {
        const [, result] = translate(`${fixtures}/conditional-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })

    test('should parse mapped type', () => {
        const [result] = translate(`${fixtures}/mapped-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should parse type with Pick utility', () => {
        const [result] = translate(`${fixtures}/type-with-pick.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should parse type with Omit utility', () => {
        const [result] = translate(`${fixtures}/type-with-omit.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should parse type with Partial utility', () => {
        const [result] = translate(`${fixtures}/type-with-partial.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
            },
            required: [],
        })
    })

    test('should parse type with Required utility', () => {
        const [result] = translate(`${fixtures}/type-with-required.ts`)
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

    test('should parse type with Readonly utility', () => {
        const [result] = translate(`${fixtures}/type-with-readonly-utility.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should parse type with Record utility', () => {
        const [result] = translate(`${fixtures}/type-with-record-utility.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should parse template literal type', () => {
        const [result] = translate(`${fixtures}/template-literal-type.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })
})
