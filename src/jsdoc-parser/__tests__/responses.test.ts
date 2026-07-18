import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Responses', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/responses'

    test('should parse response with content-type', () => {
        const fileName = `${fixtures}/with-content-type.ts`
        const result = parsePaths(fileName)

        const response = result['/users/{id}'].get.responses[200]
        expect(response.content).toHaveProperty('text/plain')

        const content = response.content['text/plain']
        expect(content.schema).toStrictEqual({
            $tsType: 'User',
            $fileName: fileName,
        })
    })

    test('should parse response without content-type', () => {
        const fileName = `${fixtures}/without-content-type.ts`
        const result = parsePaths(fileName)

        const response = result['/users/{id}'].get.responses[200]
        expect(response.content).toHaveProperty('application/json')

        const content = response.content['application/json']
        expect(content.schema).toStrictEqual({
            $tsType: 'User',
            $fileName: fileName,
        })
    })
})
