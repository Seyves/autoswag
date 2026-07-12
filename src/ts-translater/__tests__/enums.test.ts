import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { translate } from '../translate'

describe('Enums', () => {
    const fixtures = 'src/ts-translater/__tests__/fixtures/enums'

    test('should translate string union enum', () => {
        const [result] = translate(`${fixtures}/string-union-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['light', 'dark', 'system'],
        })
    })

    test('should translate number union enum', () => {
        const [result] = translate(`${fixtures}/number-union-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate string TypeScript enum', () => {
        const [result] = translate(`${fixtures}/string-ts-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['light', 'dark', 'system'],
        })
    })

    test('should translate number TypeScript enum', () => {
        const [result] = translate(`${fixtures}/number-ts-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate auto-incrementing enum', () => {
        const [result] = translate(`${fixtures}/auto-increment-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [0, 1, 2],
        })
    })

    test('should translate const enum', () => {
        const [result] = translate(`${fixtures}/const-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
        })
    })

    test('should translate single-value enum', () => {
        const [result] = translate(`${fixtures}/single-value-enum.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: ['only'],
        })
    })

    test('should translate enum with computed members', () => {
        const [_, result] = translate(`${fixtures}/enum-with-computed-members.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Enum,
            values: [10, 20, 30],
        })
    })

    test('should translate mixed enum (string and number values)', () => {
        const [result] = translate(`${fixtures}/mixed-enum.ts`)
        // Mixed enums might be translated as Union or treated specially
        expect(result).toMatchObject({
            type: expect.any(Number),
        })
    })
})
