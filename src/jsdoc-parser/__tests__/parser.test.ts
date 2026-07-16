import { expect, test } from 'vitest'
import { parsePaths } from '../parser'

const fixtures = 'src/jsdoc-parser/__tests__/fixtures'

test('should parse responses', () => {
    const fileName = `${fixtures}/responses.ts`
    const result = parsePaths(fileName)
    expect(result).toStrictEqual({
        '/something': {
            post: {
                responses: {
                    200: {
                        description: 'Ok',
                        content: {
                            'application/json': {
                                $tsType: 'Type',
                                $fileName: fileName,
                            },
                        },
                    },
                    201: {
                        description: 'Ok',
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    $ref: `#/components/schemas/MultipartResp`,
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Bad Request',
                        content: {
                            'application/json': {},
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                },
            },
        },
    })
})

test('should parse accepts without request', () => {
    const fileName = `${fixtures}/accepts-without-request.ts`
    const result = parsePaths(fileName)
    expect(result).toStrictEqual({
        '/something': {
            put: {
                requestBody: {
                    content: {
                        'application/json': {
                            $tsType: 'Type',
                            $fileName: fileName,
                        },
                        'text/csv': {
                            schema: {
                                $ref: `#/components/schemas/CSVResp`,
                            },
                        },
                        'text/plain': {},
                    },
                },
            },
        },
    })
})

test('should parse accepts', () => {
    const fileName = `${fixtures}/accepts.ts`
    const result = parsePaths(fileName)
    expect(result).toStrictEqual({
        '/something': {
            put: {
                requestBody: {
                    required: true,
                    description: 'My request',
                    content: {
                        'application/json': {
                            $tsType: 'Type',
                            $fileName: fileName,
                        },
                        'text/csv': {
                            schema: {
                                $ref: `#/components/schemas/CSVResp`,
                            },
                        },
                        'text/plain': {},
                    },
                },
            },
        },
    })
})
