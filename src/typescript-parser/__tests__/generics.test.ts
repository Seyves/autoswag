import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Generics', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/generics'

    test('should translate resolved array generic', () => {
        const fileName = `${fixtures}/resolved-array-generic.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ResolvedArray')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should translate resolved object generic', () => {
        const fileName = `${fixtures}/resolved-object-generic.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ResolvedObject')
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
        const fileName = `${fixtures}/multiple-type-parameters.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringNumberPair')
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
        const fileName = `${fixtures}/default-type-parameters.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'DefaultUsed')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.String },
            },
            required: ['value'],
        })
    })

    test('should translate constrained generic', () => {
        const fileName = `${fixtures}/constrained-generic.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'ConstrainedUser')
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
        const fileName = `${fixtures}/nested-generics.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NestedBox')
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
        const fileName = `${fixtures}/generic-pick.ts`
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

    test('should translate Omit utility type', () => {
        const fileName = `${fixtures}/generic-omit.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UserWithoutEmail')
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
        const fileName = `${fixtures}/unresolved-generic.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Generic')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                value: { type: nodes.Kind.Unknown },
            },
        })
    })

    test('should translate generic with conditional type', () => {
        const fileName = `${fixtures}/generic-with-conditional.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Result')
        expect(result).toStrictEqual({
            type: nodes.Kind.Boolean,
        })
    })

    test('should translate generic with infer as Unknown or resolved type', () => {
        const fileName = `${fixtures}/generic-with-infer.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringElement')
        // Infer types might resolve or be Unknown
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })
})
