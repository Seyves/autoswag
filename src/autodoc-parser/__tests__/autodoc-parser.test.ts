import { expect, test } from 'vitest'
import { getPathsFromFile, SchemaType } from '../request-parser'

const fixtures = 'src/autodoc-parser/__tests__/fixtures'

test('should parse responses', () => {
    const result = getPathsFromFile(`${fixtures}/responses.ts`)
    expect(result).toStrictEqual({
        '/something': {
            post: {
                responses: {
                    200: {
                        description: 'Ok',
                        content: {
                            'application/json': {
                                schema: {
                                    type: SchemaType.TsDefinition,
                                    name: 'Type',
                                },
                            },
                        },
                    },
                    201: {
                        description: 'Ok',
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: SchemaType.Predefined,
                                    ref: `#/components/schemas/MultipartResp`,
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
    const result = getPathsFromFile(`${fixtures}/accepts-without-request.ts`)
    expect(result).toStrictEqual({
        '/something': {
            put: {
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: SchemaType.TsDefinition,
                                name: 'Type',
                            },
                        },
                        'text/csv': {
                            schema: {
                                type: SchemaType.Predefined,
                                ref: `#/components/schemas/CSVResp`,
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
    const result = getPathsFromFile(`${fixtures}/accepts.ts`)
    expect(result).toStrictEqual({
        '/something': {
            put: {
                requestBody: {
                    required: true,
                    description: 'My request',
                    content: {
                        'application/json': {
                            schema: {
                                type: SchemaType.TsDefinition,
                                name: 'Type',
                            },
                        },
                        'text/csv': {
                            schema: {
                                type: SchemaType.Predefined,
                                ref: `#/components/schemas/CSVResp`,
                            },
                        },
                        'text/plain': {},
                    },
                },
            },
        },
    })
})
