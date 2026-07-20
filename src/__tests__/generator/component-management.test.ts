import { expect, test, describe } from 'vitest'
import { generate, OpenApiVersion } from '../../index'

describe('Generator - Component Management', () => {
    const fixtures = 'src/__tests__/generator/fixtures'

    describe('@component Tag Requirement', () => {
        test('should create component only when @component tag is present', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User has @component tag, should be in components
            expect(result.components.schemas).toHaveProperty('User')
        })

        test('should inline types without @component tag', () => {
            const files = [`${fixtures}/edge-cases/types-without-component-tag.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User has NO @component tag, should NOT be in components
            expect(Object.keys(result.components.schemas)).toHaveLength(0)

            // Should be inlined in the response
            const response = result.paths['/users/{id}']!.get.responses![200]!
            const schema = response.content!['application/json'].schema as any
            expect(schema).toHaveProperty('type', 'object')
            expect(schema).toHaveProperty('properties')
            expect(schema.properties).toHaveProperty('id')
            expect(schema.properties).toHaveProperty('name')
        })

        test('should mix components and inline types correctly', () => {
            const files = [`${fixtures}/edge-cases/mixed-component-and-inline.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User has @component tag
            expect(result.components.schemas).toHaveProperty('User')
            // BasicResponse has NO @component tag
            expect(result.components.schemas).not.toHaveProperty('BasicResponse')

            // User should be referenced
            const userResponse = result.paths['/users']!.post.responses![201]!
            expect(userResponse.content!['application/json'].schema).toEqual({
                $ref: '#/components/schemas/User',
            })

            // BasicResponse should be inlined
            const errorResponse = result.paths['/users']!.post.responses![400]!
            const errorSchema = errorResponse.content!['application/json'].schema as any
            expect(errorSchema).toHaveProperty('type', 'object')
            expect(errorSchema.properties).toHaveProperty('success')
            expect(errorSchema.properties).toHaveProperty('message')
        })
    })

    describe('Component Deduplication', () => {
        test('should not duplicate components when type is used multiple times', () => {
            const files = [`${fixtures}/edge-cases/same-type-multiple-uses.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User is used in 4 endpoints but should only appear once
            const userSchemas = Object.keys(result.components.schemas).filter((k) => k === 'User')
            expect(userSchemas).toHaveLength(1)
        })

        test('should reuse same component reference across endpoints', () => {
            const files = [`${fixtures}/edge-cases/same-type-multiple-uses.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const expectedRef = { schema: { $ref: '#/components/schemas/User' } }

            // All endpoints should reference the same component
            expect(
                result.paths['/users']!.get.responses![200]!.content!['application/json'],
            ).toEqual(expectedRef)
            expect(result.paths['/users']!.post.requestBody!.content!['application/json']).toEqual(
                expectedRef,
            )
            expect(
                result.paths['/users']!.post.responses![201]!.content!['application/json'],
            ).toEqual(expectedRef)
            expect(
                result.paths['/users/{id}']!.put.requestBody!.content!['application/json'],
            ).toEqual(expectedRef)
            expect(
                result.paths['/users/{id}']!.put.responses![200]!.content!['application/json'],
            ).toEqual(expectedRef)
            expect(
                result.paths['/users/{id}']!.get.responses![200]!.content!['application/json'],
            ).toEqual(expectedRef)
        })

        test('should deduplicate components across different files', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User is used in both users and posts, should only appear once
            const userSchemas = Object.keys(result.components.schemas).filter((k) => k === 'User')
            expect(userSchemas).toHaveLength(1)
        })
    })

    describe('Component Naming', () => {
        test('should use TypeScript type name as component name', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).not.toHaveProperty('user')
            expect(result.components.schemas).not.toHaveProperty('USER')
        })

        test('should preserve type alias names with @component', () => {
            const files = [
                `${fixtures}/complex/generic-types/api.ts`,
                `${fixtures}/complex/generic-types/response.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('UserResponse')
            expect(result.components.schemas).toHaveProperty('UserListResponse')
        })

        test('should name utility type results correctly', () => {
            const files = [
                `${fixtures}/complex/utility-types/api.ts`,
                `${fixtures}/complex/utility-types/base.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('PublicUser')
            expect(result.components.schemas).toHaveProperty('CreateUserRequest')
            expect(result.components.schemas).toHaveProperty('UpdateUserRequest')
        })
    })

    describe('Nested Components', () => {
        test('should extract nested types with @component as separate components', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Both User and nested UserProfile have @component tags
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('UserProfile')
        })

        test('should reference nested components in parent', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const user = result.components.schemas.User as any
            expect(user.properties.profile).toEqual({
                $ref: '#/components/schemas/UserProfile',
            })
        })

        test('should inline nested types without @component', () => {
            const files = [`${fixtures}/edge-cases/types-without-component-tag.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User type is inlined, not extracted
            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })
    })

    describe('Primitives Never Create Components', () => {
        test('should not create components for primitive types', () => {
            const files = [`${fixtures}/simple/primitives-only.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })

        test('should not create components for format types', () => {
            const files = [`${fixtures}/simple/with-formats.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })

        test('should resolve primitives correctly', () => {
            const files = [`${fixtures}/simple/primitives-only.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const requestBody = result.paths['/echo']!.post.requestBody!
            expect(requestBody.content!['text/plain'].schema).toEqual({ type: 'string' })
        })

        test('should inline primitives in parameters', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const param = result.paths['/users/{id}']!.get.parameters![0]!
            expect(param.schema).toEqual({ type: 'string' })
            expect(param.schema).not.toHaveProperty('$ref')
        })
    })

    describe('Array and Union Types', () => {
        test('should create component for array type with @component', () => {
            const files = [`${fixtures}/edge-cases/array-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Both User and UserList have @component tags
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('UserList')

            const userList = result.components.schemas.UserList as any
            expect(userList).toEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/User',
                },
            })
        })

        test('should create components for union type variants with @component', () => {
            const files = [`${fixtures}/edge-cases/union-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('SuccessResponse')
            expect(result.components.schemas).toHaveProperty('ErrorResponse')
            expect(result.components.schemas).toHaveProperty('ApiResponse')
        })

        test('should reference union variants in oneOf', () => {
            const files = [`${fixtures}/edge-cases/union-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const apiResponse = result.components.schemas.ApiResponse as any
            expect(apiResponse).toHaveProperty('oneOf')
            expect(apiResponse.oneOf).toContainEqual({
                $ref: '#/components/schemas/SuccessResponse',
            })
            expect(apiResponse.oneOf).toContainEqual({
                $ref: '#/components/schemas/ErrorResponse',
            })
        })
    })

    describe('ref: Prefix Handling', () => {
        test('should not create components for ref: prefixed types', () => {
            const files = [`${fixtures}/simple/mixed-refs-and-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).not.toHaveProperty('LegacyUserFormat')
            expect(result.components.schemas).toHaveProperty('User') // User has @component
        })

        test('should preserve $ref links for ref: prefixed types', () => {
            const files = [`${fixtures}/simple/mixed-refs-and-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const requestBody = result.paths['/users']!.post.requestBody!
            expect(requestBody.content!['application/xml'].schema).toEqual({
                $ref: '#/components/schemas/LegacyUserFormat',
            })
        })
    })

    describe('Component Count Validation', () => {
        test('should have correct total component count', () => {
            const files = [`${fixtures}/simple/multiple-endpoints.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const componentCount = Object.keys(result.components.schemas).length
            expect(componentCount).toBe(2) // User and CreateUserRequest (both have @component)
        })

        test('should not have duplicate component keys', () => {
            const files = [`${fixtures}/edge-cases/same-type-multiple-uses.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const componentKeys = Object.keys(result.components.schemas)
            const uniqueKeys = new Set(componentKeys)
            expect(componentKeys.length).toBe(uniqueKeys.size)
        })

        test('should only count types with @component tag', () => {
            const files = [`${fixtures}/edge-cases/mixed-component-and-inline.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Only User has @component, BasicResponse doesn't
            expect(Object.keys(result.components.schemas)).toHaveLength(1)
            expect(result.components.schemas).toHaveProperty('User')
        })
    })

    describe('Multiple Files Component Sharing', () => {
        test('should share components across multiple input files', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User is used in posts, should reference the same component
            const post = result.components.schemas.Post as any
            expect(post.properties.author).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should maintain component consistency across files', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // All references to User should point to the same component
            const userRefs: string[] = []

            // Check in posts
            const post = result.components.schemas.Post as any
            if (post.properties.author.$ref) {
                userRefs.push(post.properties.author.$ref)
            }

            // Check in user endpoints
            const getUserResponse =
                result.paths['/users']!.get.responses![200]!.content!['application/json']
            if ('schema' in getUserResponse && '$ref' in getUserResponse.schema) {
                userRefs.push(getUserResponse.schema.$ref)
            }

            // All should be the same reference
            expect(new Set(userRefs).size).toBe(1)
            expect(userRefs[0]).toBe('#/components/schemas/User')
        })
    })

    describe('Recursive Types with @component', () => {
        test('should handle recursive types marked with @component', () => {
            const files = [
                `${fixtures}/complex/circular-refs/api.ts`,
                `${fixtures}/complex/circular-refs/user.ts`,
                `${fixtures}/complex/circular-refs/post.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have both components
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('Post')

            // Should use $ref for circular references
            const user = result.components.schemas.User as any
            const post = result.components.schemas.Post as any

            expect(user.properties.posts).toEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Post',
                },
            })

            expect(post.properties.author).toEqual({
                $ref: '#/components/schemas/User',
            })
        })
    })

    describe('Edge Cases', () => {
        test('should handle empty components when no @component tags used', () => {
            const files = [`${fixtures}/edge-cases/types-without-component-tag.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toEqual({})
        })

        test('should handle files with no autoswag but with types', () => {
            const files = [`${fixtures}/edge-cases/no-autoswag.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should not create components if types aren't referenced
            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })
    })
})
