import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Primitives', () => {
    const fixtures = 'src/ts-translater/__tests__/fixtures/primitives'

    test('should translate string type', () => {
        const [result] = translate(`${fixtures}/string.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.String })
    })

    test('should translate number type', () => {
        const [result] = translate(`${fixtures}/number.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Number })
    })

    test('should translate boolean type', () => {
        const [result] = translate(`${fixtures}/boolean.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })

    test('should translate undefined type', () => {
        const [result] = translate(`${fixtures}/undefined.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Undefined })
    })

    test('should translate null type', () => {
        const [result] = translate(`${fixtures}/null.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Null })
    })

    test('should translate any type', () => {
        const [result] = translate(`${fixtures}/any.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate unknown type', () => {
        const [result] = translate(`${fixtures}/unknown.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate never type', () => {
        const [result] = translate(`${fixtures}/never.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate void type', () => {
        const [result] = translate(`${fixtures}/void.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Undefined })
    })

    test('should translate bigint type', () => {
        const [result] = translate(`${fixtures}/bigint.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Number })
    })

    test('should translate symbol type', () => {
        const [result] = translate(`${fixtures}/symbol.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Unknown })
    })

    test('should translate string literal type', () => {
        const [result] = translate(`${fixtures}/string-literal.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['hello'],
        })
    })

    test('should translate number literal type', () => {
        const [result] = translate(`${fixtures}/number-literal.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [42],
        })
    })

    test('should translate bigint literal', () => {
        const [result] = translate(`${fixtures}/bigint-literal.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['123'],
        })
    })

    test('should translate true literal type', () => {
        const [result] = translate(`${fixtures}/true-literal.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })

    test('should translate false literal type', () => {
        const [result] = translate(`${fixtures}/false-literal.ts`)
        expect(result).toStrictEqual({ type: nodes.Kind.Boolean })
    })
})
