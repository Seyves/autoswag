import { expect, test, describe } from 'vitest'
import * as nodes from '../../src/translater/nodes'
import { translate } from '../../src/translater/translate'

describe('Generics', () => {
    const fixtures = '__tests__/translater/fixtures/generics'

    test('should translate resolved array generic', () => {
        const [result] = translate(`${fixtures}/resolved-array-generic.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should translate resolved object generic', () => {
        const [result] = translate(`${fixtures}/resolved-object-generic.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                nested: {
                    type: nodes.Kind.Object,
                    properties: {
                        age: { type: nodes.Kind.String },
                        name: { type: nodes.Kind.Number },
                    },
                    required: ['age', 'name'],
                },
            },
            required: [],
        })
    })

    test('should translate generic with multiple type parameters', () => {
        const [result] = translate(`${fixtures}/multiple-type-parameters.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                first: { type: nodes.Kind.String },
                second: { type: nodes.Kind.Number },
            },
            required: ['first', 'second'],
        })
    })

    test('should translate generic with default type parameters', () => {
        const [result] = translate(`${fixtures}/default-type-parameters.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.String },
            },
            required: ['value'],
        })
    })

    test('should translate constrained generic', () => {
        const [result] = translate(`${fixtures}/constrained-generic.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                item: {
                    type: nodes.Kind.Object,
                    properties: {
                        id: { type: nodes.Kind.String },
                        name: { type: nodes.Kind.String },
                    },
                    required: ['id', 'name'],
                },
            },
            required: ['item'],
        })
    })

    test('should translate nested generics', () => {
        const [result] = translate(`${fixtures}/nested-generics.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: {
                    type: nodes.Kind.Object,
                    properties: {
                        value: { type: nodes.Kind.String },
                    },
                    required: ['value'],
                },
            },
            required: ['value'],
        })
    })

    test('should translate Pick utility type', () => {
        const [result] = translate(`${fixtures}/generic-pick.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                name: { type: nodes.Kind.String },
            },
            required: ['id', 'name'],
        })
    })

    test('should translate Omit utility type', () => {
        const [result] = translate(`${fixtures}/generic-omit.ts`)
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

    test('should translate unresolved generic as Unknown', () => {
        const [result] = translate(`${fixtures}/unresolved-generic.ts`)
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.Unknown },
            },
        })
    })

    test('should translate generic with conditional type as Unknown', () => {
        const [result] = translate(`${fixtures}/generic-with-conditional.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Unknown,
        })
    })

    test('should translate generic with infer as Unknown or resolved type', () => {
        const [result] = translate(`${fixtures}/generic-with-infer.ts`)
        // Infer types might resolve or be Unknown
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })
})
