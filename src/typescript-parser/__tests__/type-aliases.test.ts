import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Type Aliases', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/type-aliases'

    test('should parse type with primitives', () => {
        const fileName = `${fixtures}/type-with-primitives.ts`
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

    test('should parse imported type', () => {
        const fileName = `${fixtures}/imported-type.ts`
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

    test('should parse type with boolean union', () => {
        const fileName = `${fixtures}/type-with-boolean-union.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'BooleanUnions')
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
        const fileName = `${fixtures}/nested-type.ts`
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

    test('should parse type with optional properties', () => {
        const fileName = `${fixtures}/type-with-optional-properties.ts`
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

    test('should parse type with readonly properties', () => {
        const fileName = `${fixtures}/type-with-readonly-properties.ts`
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

    test('should parse empty type', () => {
        const fileName = `${fixtures}/empty-type.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Empty')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {},
            required: [],
        })
    })

    test('should parse type with computed property names', () => {
        const fileName = `${fixtures}/type-with-computed-property.ts`
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

    test('should parse recursive type', () => {
        const fileName = `${fixtures}/recursive-type.ts`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'List')
        expect(components).toStrictEqual({
            List: {
                type: nodes.Kind.Object,
                properties: {
                    value: { type: nodes.Kind.String },
                    next: {
                        type: nodes.Kind.Component,
                        ref: 'List',
                    },
                },
                required: ['value'],
            },
        })
        expect(result).toStrictEqual({
            type: nodes.Kind.Component,
            ref: 'List',
        })
    })

    test('should parse double recursive type', () => {
        const fileName = `${fixtures}/double-recursive-type.ts`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'List')
        expect(components).toStrictEqual({
            List: {
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
            },
        })
        expect(result).toStrictEqual({
            type: nodes.Kind.Component,
            ref: 'List',
        })
    })

    test('should parse conditional type', () => {
        const fileName = `${fixtures}/conditional-type.ts`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'Result')
        expect(result).toStrictEqual({
            type: nodes.Kind.Boolean,
        })
    })

    test('should parse mapped type', () => {
        const fileName = `${fixtures}/mapped-type.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'MappedReadonly')
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
        const fileName = `${fixtures}/type-with-pick.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UserPreview')
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
        const fileName = `${fixtures}/type-with-omit.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UserWithoutAge')
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
        const fileName = `${fixtures}/type-with-partial.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'PartialUser')
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
        const fileName = `${fixtures}/type-with-required.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'RequiredUser')
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
        const fileName = `${fixtures}/type-with-readonly-utility.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ReadonlyUser')
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
        const fileName = `${fixtures}/type-with-record-utility.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringRecord')
        expect(result).toStrictEqual({
            type: nodes.Kind.Record,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should parse template literal type', () => {
        const fileName = `${fixtures}/template-literal-type.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'EmailLocale')
        expect(result).toStrictEqual({
            type: nodes.Kind.String,
        })
    })
})
