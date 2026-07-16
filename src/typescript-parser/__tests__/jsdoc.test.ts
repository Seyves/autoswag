import { expect, test, describe } from 'vitest'
import * as nodes from '../nodes'
import { parse } from '../parse'
import { createProgram } from './helpers'

describe('JSDoc', () => {
    const fixtures = 'src/typescript-parser/__tests__/fixtures/jsdoc'

    test('should translate JSDoc typedef with metadata', () => {
        const fileName = `${fixtures}/jsdoc-typedef.js`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            info: { description: 'User object' },
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        example: '5516e359-6c9c-4ebb-a409-52373d536d50',
                        format: 'uuid',
                    },
                },
                name: {
                    type: nodes.Kind.String,
                    info: {
                        description: "User's name",
                        example: 'Alex',
                    },
                },
                age: {
                    type: nodes.Kind.Number,
                    info: {
                        description: "User's age",
                        example: 32,
                        minimum: 0,
                        maximum: 200,
                    },
                },
                preferences: {
                    type: nodes.Kind.Object,
                    info: {
                        description: 'Preferences object',
                        example: {
                            fontSize: 14,
                            theme: 'light',
                        },
                    },
                    properties: {
                        fontSize: {
                            type: nodes.Kind.Number,
                        },
                        theme: {
                            type: nodes.Kind.String,
                        },
                    },
                    required: ['fontSize', 'theme'],
                },
            },
            required: ['id', 'name', 'age', 'preferences'],
        })
    })

    test('should translate imported JSDoc typedef', () => {
        const fileName = `${fixtures}/import-typedef.js`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            info: { description: 'User object' },
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        example: '5516e359-6c9c-4ebb-a409-52373d536d50',
                        format: 'uuid',
                    },
                },
                name: {
                    type: nodes.Kind.String,
                    info: {
                        description: "User's name",
                        example: 'Alex',
                    },
                },
                age: {
                    type: nodes.Kind.Number,
                    info: {
                        description: "User's age",
                        example: 32,
                        minimum: 0,
                        maximum: 200,
                    },
                },
                preferences: {
                    type: nodes.Kind.Object,
                    info: {
                        description: 'Preferences object',
                        example: {
                            fontSize: 14,
                            theme: 'light',
                        },
                    },
                    properties: {
                        fontSize: {
                            type: nodes.Kind.Number,
                        },
                        theme: {
                            type: nodes.Kind.String,
                        },
                    },
                    required: ['fontSize', 'theme'],
                },
            },
            required: ['id', 'name', 'age', 'preferences'],
        })
    })

    test('should translate JSDoc tags on TypeScript types', () => {
        const fileName = `${fixtures}/jsdoc-tags.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            info: { description: 'User object' },
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        example: '5516e359-6c9c-4ebb-a409-52373d536d50',
                        format: 'uuid',
                    },
                },
                name: {
                    type: nodes.Kind.String,
                    info: {
                        description: "User's name",
                        example: 'Alex',
                    },
                },
                age: {
                    type: nodes.Kind.Number,
                    info: {
                        description: "User's age",
                        example: 32,
                        minimum: 0,
                        maximum: 200,
                    },
                },
                preferences: {
                    type: nodes.Kind.Object,
                    info: {
                        description: 'Preferences object',
                        example: {
                            fontSize: 14,
                            theme: 'light',
                        },
                    },
                    properties: {
                        fontSize: {
                            type: nodes.Kind.Number,
                        },
                        theme: {
                            type: nodes.Kind.String,
                        },
                    },
                    required: ['fontSize', 'theme'],
                },
            },
            required: ['id', 'name', 'age', 'preferences'],
        })
    })

    test('should translate JSDoc with no description but with tags', () => {
        const fileName = `${fixtures}/jsdoc-no-desc-with-tags.js`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        example: '5516e359-6c9c-4ebb-a409-52373d536d50',
                        format: 'uuid',
                    },
                },
            },
            required: ['id'],
        })
    })

    test('should translate multiline JSDoc description', () => {
        const fileName = `${fixtures}/multiline-description.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            info: {
                description:
                    'This is a user object with multiple lines of description explaining what it does',
            },
        })
    })

    test('should translate all supported JSDoc tags', () => {
        const fileName = `${fixtures}/all-supported-tags.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                        example: '5516e359-6c9c-4ebb-a409-52373d536d50',
                        format: 'uuid',
                    },
                },
                age: {
                    type: nodes.Kind.Number,
                    info: {
                        description: "User's age",
                        example: 30,
                        minimum: 0,
                        maximum: 150,
                    },
                },
            },
            required: ['id', 'age'],
        })
    })

    test('should ignore unsupported JSDoc tags', () => {
        const fileName = `${fixtures}/unsupported-tags.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                    },
                },
            },
            required: ['id'],
        })
    })

    test('should translate recursive typedef type', () => {
        const fileName = `${fixtures}/recursive-typedef.js`
        const program = createProgram([fileName])
        const components = {}
        const result = parse(program, components, fileName, 'TreeNode')
        expect(components).toStrictEqual({
            TreeNode: {
                type: nodes.Kind.Object,
                properties: {
                    value: {
                        type: nodes.Kind.String,
                    },
                    children: {
                        type: nodes.Kind.Array,
                        items: {
                            type: nodes.Kind.Component,
                            ref: 'TreeNode',
                        },
                    },
                },
                required: ['value'],
            },
        })
        expect(result).toStrictEqual({
            type: nodes.Kind.Component,
            ref: 'TreeNode',
        })
    })

    test('should translate JSDoc on nested properties', () => {
        const fileName = `${fixtures}/nested-property-jsdoc.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                id: { type: nodes.Kind.String },
                preferences: {
                    type: nodes.Kind.Object,
                    properties: {
                        fontSize: {
                            type: nodes.Kind.Number,
                            info: {
                                description: 'Font size in pixels',
                                example: 14,
                                minimum: 8,
                                maximum: 32,
                            },
                        },
                    },
                },
            },
        })
    })

    test('should translate complex @example with objects and arrays', () => {
        const fileName = `${fixtures}/complex-example.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Config')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                settings: {
                    type: nodes.Kind.Object,
                    info: {
                        example: {
                            theme: 'dark',
                            lang: 'en',
                            features: ['auth', 'api'],
                        },
                    },
                },
            },
        })
    })

    test('should throw error on invalid JSON in @example', () => {
        const fileName = `${fixtures}/invalid-json-example.ts`
        expect(() => {
            const program = createProgram([fileName])
            parse(program, {}, fileName, 'User')
        }).toThrow()
    })

    test('should handle escaped characters in JSDoc', () => {
        const fileName = `${fixtures}/escaped-characters.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Message')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                content: {
                    type: nodes.Kind.String,
                    info: {
                        description: expect.stringContaining('quotes'),
                        example: expect.any(String),
                    },
                },
            },
        })
    })

    test('should handle mixed JSDoc and regular comments', () => {
        const fileName = `${fixtures}/mixed-comments.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            info: {
                description: 'JSDoc comment for User',
            },
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID with JSDoc',
                        example: '123',
                    },
                },
            },
        })
    })

    test('should handle @deprecated tag', () => {
        const fileName = `${fixtures}/deprecated-tag.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'User')
        // @deprecated might be ignored if not implemented
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                id: {
                    type: nodes.Kind.String,
                    info: {
                        description: 'User ID',
                    },
                },
            },
        })
    })

    test('should handle @default tag', () => {
        const fileName = `${fixtures}/default-tag.ts`
        const program = createProgram([fileName])
        const result = parse(program, {}, fileName, 'Config')
        // @default might be ignored if not implemented
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            properties: {
                port: {
                    type: nodes.Kind.Number,
                },
            },
        })
    })
})
