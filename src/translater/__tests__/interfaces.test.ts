import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Interfaces', () => {
    const fixtures = 'src/translater/__tests__/fixtures/interfaces'

    test('should parse interface with primitives', () => {
        const [result] = translate(`${fixtures}/interface-with-primitives.ts`)
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

    test('should parse nested interface', () => {
        const [result] = translate(`${fixtures}/nested-interface.ts`)
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

    test('should parse interface with optional properties', () => {
        const [result] = translate(`${fixtures}/interface-with-optional-properties.ts`)
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

    test('should parse interface with readonly properties', () => {
        const [result] = translate(`${fixtures}/interface-with-readonly-properties.ts`)
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

    test('should parse interface extending single interface', () => {
        const [result] = translate(`${fixtures}/interface-extending-single.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
            },
            required: ['age', 'id', 'name'],
        })
    })

    test('should parse interface extending multiple interfaces', () => {
        const [result] = translate(`${fixtures}/interface-extending-multiple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
                age: { type: nodes.Kind.Number },
            },
            required: ['age', 'id', 'name'],
        })
    })

    test('should parse interface with method signatures', () => {
        const [result] = translate(`${fixtures}/interface-with-methods.ts`)
        // Methods should be ignored
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.Number },
            },
            required: ['value'],
        })
    })

    test('should parse empty interface', () => {
        const [result] = translate(`${fixtures}/empty-interface.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {},
            required: [],
        })
    })

    test('should parse interface with string index signature as Record', () => {
        const [result] = translate(`${fixtures}/interface-with-string-index.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should parse interface with number index signature as Record', () => {
        const [result] = translate(`${fixtures}/interface-with-number-index.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.String },
        })
    })

    test('should parse interface with computed property names', () => {
        const [result] = translate(`${fixtures}/interface-with-computed-property.ts`)
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

    test('should parse interface merging', () => {
        const [result] = translate(`${fixtures}/interface-merging.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should parse interface with call signature', () => {
        const [result] = translate(`${fixtures}/interface-with-call-signature.ts`)
        // Call signatures might be ignored, only properties are kept
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                property: { type: nodes.Kind.Boolean },
            },
        })
    })
})
