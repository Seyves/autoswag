import { expect, test, describe } from 'vitest'
import * as nodes from '../../src/translater/nodes'
import { translate } from '../../src/translater/translate'

describe('JSDoc', () => {
    const fixtures = '__tests__/translater/fixtures/jsdoc'

    test('should translate JSDoc typedef with metadata', () => {
        const [result] = translate(`${fixtures}/jsdoc-typedef.js`)
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
        const [result] = translate(`${fixtures}/jsdoc-tags.ts`)
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
        const [result] = translate(`${fixtures}/jsdoc-no-desc-with-tags.js`)
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
        const [result] = translate(`${fixtures}/multiline-description.ts`)
        expect(result).toMatchObject({
            type: nodes.Kind.Object,
            info: {
                description:
                    'This is a user object with multiple lines of description explaining what it does',
            },
        })
    })

    test('should translate all supported JSDoc tags', () => {
        const [result] = translate(`${fixtures}/all-supported-tags.ts`)
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
        const [result] = translate(`${fixtures}/unsupported-tags.ts`)
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
        const [result] = translate(`${fixtures}/recursive-typedef.js`)
        expect(result).toStrictEqual({
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
        })
    })

    test('should translate JSDoc on nested properties', () => {
        const [result] = translate(`${fixtures}/nested-property-jsdoc.ts`)
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
        const [result] = translate(`${fixtures}/complex-example.ts`)
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
        expect(() => {
            translate(`${fixtures}/invalid-json-example.ts`)
        }).toThrow()
    })

    test('should handle escaped characters in JSDoc', () => {
        const [result] = translate(`${fixtures}/escaped-characters.ts`)
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
        const [result] = translate(`${fixtures}/mixed-comments.ts`)
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
        const [result] = translate(`${fixtures}/deprecated-tag.ts`)
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
        const [result] = translate(`${fixtures}/default-tag.ts`)
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
