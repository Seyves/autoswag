import { describe, test, expect } from 'vitest'
import { parse } from '../../typescript-parser/parse'
import * as nodes from '../../typescript-parser/nodes'
import { createProgram } from './helpers'

describe('Zod inheritance', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/zod'

    test('should inherit tags and descriptions', () => {
        const fileName = `${fixtures}/tags-and-description.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')

        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: { format: 'uuid', description: 'User ID' },
                },
                name: {
                    type: nodes.Kind.String,
                    info: { description: 'User name' },
                },
                age: {
                    type: nodes.Kind.Number,
                },
                isActive: {
                    type: nodes.Kind.Boolean,
                },
            },
            required: ['id', 'name', 'age', 'isActive'],
        })
    })

    test('should inherit tags and descriptions (v3)', () => {
        const fileName = `${fixtures}/tags-and-description-v3.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')

        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: { format: 'uuid', description: 'User ID' },
                },
                name: {
                    type: nodes.Kind.String,
                    info: { description: 'User name' },
                },
                age: {
                    type: nodes.Kind.Number,
                },
                isActive: {
                    type: nodes.Kind.Boolean,
                },
            },
            required: ['id', 'name', 'age', 'isActive'],
        })
    })

    test('should inherit nested objects with Zod schemas', () => {
        const fileName = `${fixtures}/nested-objects.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')

        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            required: ['id', 'email', 'address', 'billing'],
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        format: 'uuid',
                    },
                },
                email: {
                    type: nodes.Kind.String,
                    info: {
                        format: 'email',
                    },
                },
                address: {
                    type: nodes.Kind.Object,
                    required: ['street', 'city', 'zip'],
                    properties: {
                        street: {
                            info: {
                                description: 'Street address',
                            },
                            type: nodes.Kind.String,
                        },
                        city: {
                            type: nodes.Kind.String,
                        },
                        zip: {
                            type: nodes.Kind.String,
                        },
                    },
                },
                billing: {
                    type: nodes.Kind.Object,
                    required: ['cardNumber', 'cvv'],
                    properties: {
                        cardNumber: {
                            type: nodes.Kind.String,
                        },
                        cvv: {
                            type: nodes.Kind.String,
                        },
                    },
                },
            },
        })
    })

    test('should inherit nested objects with Zod schemas (v3)', () => {
        const fileName = `${fixtures}/nested-objects.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')

        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            required: ['id', 'email', 'address', 'billing'],
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        format: 'uuid',
                    },
                },
                email: {
                    type: nodes.Kind.String,
                    info: {
                        format: 'email',
                    },
                },
                address: {
                    type: nodes.Kind.Object,
                    required: ['street', 'city', 'zip'],
                    properties: {
                        street: {
                            info: {
                                description: 'Street address',
                            },
                            type: nodes.Kind.String,
                        },
                        city: {
                            type: nodes.Kind.String,
                        },
                        zip: {
                            type: nodes.Kind.String,
                        },
                    },
                },
                billing: {
                    type: nodes.Kind.Object,
                    required: ['cardNumber', 'cvv'],
                    properties: {
                        cardNumber: {
                            type: nodes.Kind.String,
                        },
                        cvv: {
                            type: nodes.Kind.String,
                        },
                    },
                },
            },
        })
    })
})
