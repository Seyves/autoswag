import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Responses', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/body'

    test('should parse body', () => {
        const fileName = `${fixtures}/body.ts`
        const result = parsePaths(fileName)

        const request = result['/users/{id}'].put.requestBody
        expect(request).toMatchObject({
            required: true,
            description: 'User payload',
        })
    })

    test('should parse accept with body', () => {
        const fileName = `${fixtures}/accept-with-body.ts`
        const result = parsePaths(fileName)

        const request = result['/users/{id}'].put.requestBody
        expect(request).toStrictEqual({
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $tsType: 'User',
                        $fileName: fileName,
                        $position: [4, 13]
                    },
                },
            },
        })
    })

    test('should parse accept without body', () => {
        const fileName = `${fixtures}/accept-without-body.ts`
        const result = parsePaths(fileName)

        const request = result['/users/{id}'].put.requestBody
        expect(request).toStrictEqual({
            content: {
                'application/json': {
                    schema: {
                        $tsType: 'User',
                        $fileName: fileName,
                        $position: [3, 13]
                    },
                },
            },
        })
    })
})
