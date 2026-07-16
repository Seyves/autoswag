import { expect, test, describe } from 'vitest'
import { parsePaths } from '../parser'

describe('Security', () => {
    const fixtures = 'src/jsdoc-parser/__tests__/fixtures/security'

    test('should parse single security scheme without scopes', () => {
        const fileName = `${fixtures}/single-security.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/protected': {
                get: {
                    security: [
                        {
                            BearerAuth: [],
                        },
                    ],
                },
            },
        })
    })

    test('should parse security scheme with scopes', () => {
        const fileName = `${fixtures}/security-with-scopes.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/admin': {
                post: {
                    security: [
                        {
                            OAuth2: ['read:users', 'write:users'],
                        },
                    ],
                },
            },
        })
    })

    test('should parse multiple security schemes (OR logic)', () => {
        const fileName = `${fixtures}/multiple-security.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/data': {
                get: {
                    security: [
                        {
                            BearerAuth: [],
                        },
                        {
                            ApiKeyAuth: [],
                        },
                    ],
                },
            },
        })
    })

    test('should parse security with empty scopes description', () => {
        const fileName = `${fixtures}/security-empty-scopes.ts`
        const result = parsePaths(fileName)
        expect(result).toStrictEqual({
            '/basic': {
                get: {
                    security: [
                        {
                            BasicAuth: [],
                        },
                    ],
                },
            },
        })
    })
})
