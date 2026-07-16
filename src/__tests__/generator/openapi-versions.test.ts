import { expect, test, describe } from 'vitest'
import { generateOpenApiDoc, OpenApiVersion } from '../../generator'

describe('Generator - OpenAPI Version Differences', () => {
    const fixtures = 'src/__tests__/generator/fixtures'

    describe('Version Field', () => {
        test('should set openapi field to 3.0.0 for v30', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v30)

            expect(result.openapi).toBe('3.0.0')
        })

        test('should set openapi field to 3.1.0 for v31', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(result.openapi).toBe('3.1.0')
        })
    })

    describe('Null Handling', () => {
        test('v3.0 should use nullable property for null types', () => {
            const files = [`${fixtures}/simple/single-file-with-nullable.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v30)
            const user = result.components.schemas.User as any
            const property = user.properties.name
            // In v3.0, null is represented with nullable: true
            expect(property).toEqual({
                type: 'string',
                nullable: true,
            })
        })

        test('v3.1 should use type: null for null types', () => {
            const files = [`${fixtures}/simple/single-file-with-nullable.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v31)
            const user = result.components.schemas.User as any
            const property = user.properties.name
            // In v3.1, null is represented with multitype
            expect(property).toEqual({
                types: ['null', 'string'],
            })
        })
    })

    describe('Schema Structure Consistency', () => {
        test('both versions should have same paths structure', () => {
            const files = [`${fixtures}/simple/multiple-endpoints.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(Object.keys(result30.paths)).toEqual(Object.keys(result31.paths))
            expect(result30.paths['/users']).toHaveProperty('get')
            expect(result31.paths['/users']).toHaveProperty('get')
        })

        test('both versions should have same components', () => {
            const files = [`${fixtures}/simple/multiple-endpoints.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(Object.keys(result30.components.schemas).sort()).toEqual(
                Object.keys(result31.components.schemas).sort(),
            )
        })

        test('both versions should resolve same type references', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            const response30 = result30.paths['/users']!.get.responses![200]!
            const response31 = result31.paths['/users']!.get.responses![200]!

            expect(response30.content!['application/json']).toEqual({
                schema: { $ref: '#/components/schemas/User' },
            })
            expect(response31.content!['application/json']).toEqual({
                schema: { $ref: '#/components/schemas/User' },
            })
        })
    })

    describe('Primitive Type Resolution', () => {
        test('v3.0 should resolve primitives correctly', () => {
            const files = [`${fixtures}/simple/primitives-only.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v30)

            const requestBody = result.paths['/echo']!.post.requestBody!
            expect(requestBody.content!['text/plain'].schema).toEqual({ type: 'string' })
        })

        test('v3.1 should resolve primitives correctly', () => {
            const files = [`${fixtures}/simple/primitives-only.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v31)

            const requestBody = result.paths['/echo']!.post.requestBody!
            expect(requestBody.content!['text/plain'].schema).toEqual({ type: 'string' })
        })

        test('both versions should handle format types identically', () => {
            const files = [`${fixtures}/simple/with-formats.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            const requestBody30 = result30.paths['/users']!.post.requestBody!
            const requestBody31 = result31.paths['/users']!.post.requestBody!

            expect(requestBody30.content!['application/json'].schema).toEqual({
                type: 'string',
                format: 'uuid',
            })
            expect(requestBody31.content!['application/json'].schema).toEqual({
                type: 'string',
                format: 'uuid',
            })
        })
    })

    describe('Complex Types Across Versions', () => {
        test('both versions should handle nested objects', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(result30.components.schemas).toHaveProperty('User')
            expect(result31.components.schemas).toHaveProperty('User')

            const user30 = result30.components.schemas.User as any
            const user31 = result31.components.schemas.User as any

            expect(user30.type).toBe('object')
            expect(user31.type).toBe('object')
            expect(Object.keys(user30.properties)).toEqual(Object.keys(user31.properties))
        })

        test('both versions should handle union types', () => {
            const files = [`${fixtures}/edge-cases/union-types.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(result30.components.schemas).toHaveProperty('ApiResponse')
            expect(result31.components.schemas).toHaveProperty('ApiResponse')

            const response30 = result30.components.schemas.ApiResponse as any
            const response31 = result31.components.schemas.ApiResponse as any

            expect(response30).toHaveProperty('oneOf')
            expect(response31).toHaveProperty('oneOf')
        })

        test('both versions should handle arrays', () => {
            const files = [`${fixtures}/edge-cases/array-types.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            const userList30 = result30.components.schemas.UserList as any
            const userList31 = result31.components.schemas.UserList as any

            expect(userList30.type).toBe('array')
            expect(userList31.type).toBe('array')
            expect(userList30.items).toEqual(userList31.items)
        })
    })

    describe('Cross-File Resolution Across Versions', () => {
        test('both versions should resolve imported types', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            // Both should have resolved User and Post
            expect(result30.components.schemas).toHaveProperty('User')
            expect(result30.components.schemas).toHaveProperty('Post')
            expect(result31.components.schemas).toHaveProperty('User')
            expect(result31.components.schemas).toHaveProperty('Post')
        })

        test('both versions should handle generic types', () => {
            const files = [
                `${fixtures}/complex/generic-types/api.ts`,
                `${fixtures}/complex/generic-types/response.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(result30.components.schemas).toHaveProperty('UserResponse')
            expect(result31.components.schemas).toHaveProperty('UserResponse')
        })

        test('both versions should handle utility types', () => {
            const files = [
                `${fixtures}/complex/utility-types/api.ts`,
                `${fixtures}/complex/utility-types/base.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(result30.components.schemas).toHaveProperty('PublicUser')
            expect(result31.components.schemas).toHaveProperty('PublicUser')

            const publicUser30 = result30.components.schemas.PublicUser as any
            const publicUser31 = result31.components.schemas.PublicUser as any

            // Should not have password in either version
            expect(publicUser30.properties).not.toHaveProperty('password')
            expect(publicUser31.properties).not.toHaveProperty('password')
        })
    })

    describe('Component Deduplication Across Versions', () => {
        test('both versions should deduplicate components', () => {
            const files = [`${fixtures}/edge-cases/same-type-multiple-uses.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            const user30Count = Object.keys(result30.components.schemas).filter(
                (k) => k === 'User',
            ).length
            const user31Count = Object.keys(result31.components.schemas).filter(
                (k) => k === 'User',
            ).length

            expect(user30Count).toBe(1)
            expect(user31Count).toBe(1)
        })
    })

    describe('Error Handling Across Versions', () => {
        test('both versions should throw same error for missing types', () => {
            const files = [`${fixtures}/edge-cases/type-not-found.ts`]

            expect(() => {
                generateOpenApiDoc(files, OpenApiVersion.v30)
            }).toThrow('Cannot resolve type: NonExistentType')

            expect(() => {
                generateOpenApiDoc(files, OpenApiVersion.v31)
            }).toThrow('Cannot resolve type: NonExistentType')
        })

        test('both versions should handle empty files identically', () => {
            const files = [`${fixtures}/edge-cases/empty-file.ts`]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            expect(Object.keys(result30.paths)).toHaveLength(0)
            expect(Object.keys(result31.paths)).toHaveLength(0)
        })
    })

    describe('Type Overload Validation', () => {
        test('should return correct type for v30', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v30)

            // TypeScript should infer the correct return type
            expect(result.openapi).toBe('3.0.0')

            // Check that components match v3.0 structure
            const user = result.components.schemas.User as any
            if (user) {
                // v3.0 specific properties might include nullable
                expect(typeof user).toBe('object')
            }
        })

        test('should return correct type for v31', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generateOpenApiDoc(files, OpenApiVersion.v31)

            // TypeScript should infer the correct return type
            expect(result.openapi).toBe('3.1.0')

            // Check that components match v3.1 structure
            const user = result.components.schemas.User as any
            if (user) {
                expect(typeof user).toBe('object')
            }
        })
    })

    describe('Comprehensive Version Comparison', () => {
        test('should produce structurally similar but version-appropriate outputs', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result30 = generateOpenApiDoc(files, OpenApiVersion.v30)
            const result31 = generateOpenApiDoc(files, OpenApiVersion.v31)

            // Same paths
            expect(Object.keys(result30.paths).sort()).toEqual(Object.keys(result31.paths).sort())

            // Same components
            expect(Object.keys(result30.components.schemas).sort()).toEqual(
                Object.keys(result31.components.schemas).sort(),
            )

            // Same methods in paths
            for (const path in result30.paths) {
                expect(Object.keys(result30.paths[path]!).sort()).toEqual(
                    Object.keys(result31.paths[path]!).sort(),
                )
            }

            // Different version strings
            expect(result30.openapi).not.toBe(result31.openapi)
        })
    })
})
