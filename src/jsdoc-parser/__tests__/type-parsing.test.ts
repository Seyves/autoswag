import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Type parsing', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/type-parsing'

    test('should parse type with static ref', () => {
        const fileName = `${fixtures}/static-ref.ts`
        const result = parsePaths(fileName)

        const request = result['/sheet'].post.requestBody
        expect(request.content).toHaveProperty('text/csv')

        const content = request.content['text/csv']
        expect(content.schema).toStrictEqual({
            $ref: `#/components/schemas/CSVResp`,
        })
    })

    test('should parse type with ts type reference', () => {
        const fileName = `${fixtures}/ts-type-reference.ts`
        const result = parsePaths(fileName)

        const request = result['/users/{id}'].put.requestBody
        expect(request.content).toHaveProperty('application/json')

        const content = request.content['application/json']
        expect(content.schema).toStrictEqual({
            $tsType: 'User',
            $fileName: fileName,
        })
    })

    test('should parse type with ts type expression', () => {
        const fileName = `${fixtures}/ts-expression.ts`
        const result = parsePaths(fileName)

        const request = result['/users'].post.requestBody
        expect(request.content).toHaveProperty('application/json')

        const content = request.content['application/json']
        expect(content.schema).toStrictEqual({
            $tsType: 'Record<string, Type>',
            $fileName: fileName,
            $isExpr: true,
        })
    })
})
