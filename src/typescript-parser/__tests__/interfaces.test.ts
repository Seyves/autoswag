import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Interfaces', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/interfaces'

    test('should parse interface with primitives', () => {
        const fileName = `${fixtures}/interface-with-primitives.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
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
        const fileName = `${fixtures}/nested-interface.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
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
        const fileName = `${fixtures}/interface-with-optional-properties.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'OptionalProps')
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
        const fileName = `${fixtures}/interface-with-readonly-properties.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ReadonlyProps')
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
        const fileName = `${fixtures}/interface-extending-single.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Extended')
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
        const fileName = `${fixtures}/interface-extending-multiple.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
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
        const fileName = `${fixtures}/interface-with-methods.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Calculator')
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
        const fileName = `${fixtures}/empty-interface.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Empty')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {},
            required: [],
        })
    })

    test('should parse interface with string index signature as Record', () => {
        const fileName = `${fixtures}/interface-with-string-index.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringIndexed')
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should parse interface with number index signature as Record', () => {
        const fileName = `${fixtures}/interface-with-number-index.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NumberIndexed')
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.String },
        })
    })

    test('should parse interface with computed property names', () => {
        const fileName = `${fixtures}/interface-with-computed-property.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ComputedProp')
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
        const fileName = `${fixtures}/interface-merging.ts`
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

    test('should parse interface with call signature', () => {
        const fileName = `${fixtures}/interface-with-call-signature.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Callable')
        // Call signatures might be ignored, only properties are kept
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                property: { type: nodes.Kind.Boolean },
            },
        })
    })
})
