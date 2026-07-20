import { expect, test, describe } from 'vitest'
import { parseTypeExpression } from '../parse'
import { createProgram } from './helpers'
import * as nodes from '../nodes'

describe('Type expression parsing', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/expression-parsing'

    test('should parse type expression with local type', () => {
        const fileName = `${fixtures}/local.ts`
        const program = createProgram([fileName])
        const result = parseTypeExpression(program, {}, fileName, 'User[]', '')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: 5,
                required: ['id', 'name'],
                properties: {
                    id: { type: nodes.Kind.String },
                    name: { type: nodes.Kind.String },
                },
            },
        })
    })

    test('should parse type expression with imported type', () => {
        const fileName = `${fixtures}/imported.ts`
        const program = createProgram([fileName])
        const result = parseTypeExpression(program, {}, fileName, 'User[]', '')
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: 5,
                required: ['id', 'name'],
                properties: {
                    id: { type: nodes.Kind.String },
                    name: { type: nodes.Kind.String },
                },
            },
        })
    })
})
