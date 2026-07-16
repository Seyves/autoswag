import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('Primitives', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/primitives'

    test('should translate string type', () => {
        const fileName = `${fixtures}/string.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringType')
        expect(result).toStrictEqual({ type: nodes.Kind.String })
    })

    test('should translate number type', () => {
        const fileName = `${fixtures}/number.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NumberType')
        expect(result).toStrictEqual({ type: nodes.Kind.Number })
    })

    test('should translate boolean type', () => {
        const fileName = `${fixtures}/boolean.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'BooleanType')
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })

    test('should translate undefined type', () => {
        const fileName = `${fixtures}/undefined.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UndefinedType')
        expect(result).toStrictEqual({ type: nodes.Kind.Undefined })
    })

    test('should translate null type', () => {
        const fileName = `${fixtures}/null.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NullType')
        expect(result).toStrictEqual({ type: nodes.Kind.Null })
    })

    test('should translate any type', () => {
        const fileName = `${fixtures}/any.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'AnyType')
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate unknown type', () => {
        const fileName = `${fixtures}/unknown.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'UnknownType')
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate never type', () => {
        const fileName = `${fixtures}/never.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NeverType')
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate void type', () => {
        const fileName = `${fixtures}/void.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'VoidType')
        expect(result).toStrictEqual({ type: nodes.Kind.Undefined })
    })

    test('should translate bigint type', () => {
        const fileName = `${fixtures}/bigint.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'BigIntType')
        expect(result).toStrictEqual({ type: nodes.Kind.Number })
    })

    test('should translate symbol type', () => {
        const fileName = `${fixtures}/symbol.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'SymbolType')
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate string literal type', () => {
        const fileName = `${fixtures}/string-literal.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'StringLiteral')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['hello'],
        })
    })

    test('should translate number literal type', () => {
        const fileName = `${fixtures}/number-literal.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'NumberLiteral')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [42],
        })
    })

    test('should translate bigint literal', () => {
        const fileName = `${fixtures}/bigint-literal.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'BigIntLiteral')
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['123'],
        })
    })

    test('should translate true literal type', () => {
        const fileName = `${fixtures}/true-literal.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'TrueLiteral')
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })

    test('should translate false literal type', () => {
        const fileName = `${fixtures}/false-literal.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'FalseLiteral')
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })
})
