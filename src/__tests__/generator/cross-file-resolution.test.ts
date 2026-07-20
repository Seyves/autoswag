import { expect, test, describe } from 'vitest'
import { generate, OpenApiVersion } from '../../index'

describe('Generator - Cross-File Type Resolution', () => {
    const fixtures = 'src/__tests__/generator/fixtures'

    describe('Basic Imports', () => {
        test('should resolve types from imported file', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have resolved User type from types.ts
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas.User).toHaveProperty('type', 'object')
            expect(result.components.schemas.User).toHaveProperty('properties')
        })

        test('should resolve nested types from imports', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User type contains UserProfile
            expect(result.components.schemas).toHaveProperty('UserProfile')
            expect(result.components.schemas.UserProfile).toEqual({
                type: 'object',
                properties: {
                    bio: { type: 'string' },
                    avatar: { type: 'string' },
                },
                required: ['bio', 'avatar'],
            })
        })

        test('should link imported types in responses', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const response = result.paths['/users']!.get.responses![200]!
            expect(response.content!['application/json'].schema).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should link imported types in request body', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const requestBody = result.paths['/users']!.post.requestBody!
            expect(requestBody.content!['application/json'].schema).toEqual({
                $ref: '#/components/schemas/CreateUserRequest',
            })
        })
    })

    describe('Multiple Files with Separate Endpoints', () => {
        test('should merge paths from multiple API files', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have both users and posts paths
            expect(result.paths).toHaveProperty('/users')
            expect(result.paths).toHaveProperty('/posts')
            expect(result.paths).toHaveProperty('/users/{id}')
        })

        test('should resolve types from all files', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have types from both modules
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('Post')
            expect(result.components.schemas).toHaveProperty('CreateUserRequest')
            expect(result.components.schemas).toHaveProperty('CreatePostRequest')
        })
    })

    describe('Transitive Dependencies', () => {
        test('should resolve types imported from another module', () => {
            const files = [
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Post references User from another module
            expect(result.components.schemas).toHaveProperty('Post')
            expect(result.components.schemas).toHaveProperty('User')

            // Post.author should reference User
            const postSchema = result.components.schemas.Post as any
            expect(postSchema.properties.author).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should handle deep nested imports', () => {
            const files = [
                `${fixtures}/complex/nested-imports/api.ts`,
                `${fixtures}/complex/nested-imports/dto.ts`,
                `${fixtures}/complex/nested-imports/models.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v31 })

            // Should resolve DTOs that extend BaseModel
            expect(result.components.schemas).toHaveProperty('UserDTO')
            expect(result.components.schemas).toHaveProperty('ProductDTO')
            // BaseModel is not directly referenced, so it won't be a component
            // Its properties are merged into UserDTO and ProductDTO
        })

        test('should correctly merge inherited properties', () => {
            const files = [
                `${fixtures}/complex/nested-imports/api.ts`,
                `${fixtures}/complex/nested-imports/dto.ts`,
                `${fixtures}/complex/nested-imports/models.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const userDTO = result.components.schemas.UserDTO as any
            expect(userDTO.properties).toHaveProperty('id')
            expect(userDTO.properties).toHaveProperty('createdAt')
            expect(userDTO.properties).toHaveProperty('updatedAt')
            expect(userDTO.properties).toHaveProperty('username')
            expect(userDTO.properties).toHaveProperty('email')
        })
    })

    describe('Shared Types Across Modules', () => {
        test('should resolve shared types from common module', () => {
            const files = [
                `${fixtures}/cross-file/shared/api-with-shared.ts`,
                `${fixtures}/cross-file/shared/common.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('ErrorResponse')
        })

        test('should handle types used in multiple modules', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
                `${fixtures}/cross-file/posts/api.ts`,
                `${fixtures}/cross-file/posts/types.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // User is used in both users and posts modules
            const userSchemaKeys = Object.keys(result.components.schemas).filter(
                (k) => k === 'User',
            )
            expect(userSchemaKeys).toHaveLength(1) // Should only appear once
        })
    })

    describe('Generic Types', () => {
        test('should resolve generic types with concrete type parameters', () => {
            const files = [
                `${fixtures}/complex/generic-types/api.ts`,
                `${fixtures}/complex/generic-types/response.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have resolved UserResponse (ApiResponse<User>)
            expect(result.components.schemas).toHaveProperty('UserResponse')
            const userResponse = result.components.schemas.UserResponse as any
            expect(userResponse.type).toBe('object')
            expect(userResponse.properties).toHaveProperty('success')
            expect(userResponse.properties).toHaveProperty('data')
            expect(userResponse.properties).toHaveProperty('timestamp')
        })

        test('should correctly instantiate generic type with data property', () => {
            const files = [
                `${fixtures}/complex/generic-types/api.ts`,
                `${fixtures}/complex/generic-types/response.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const userResponse = result.components.schemas.UserResponse as any
            // data should be User type
            expect(userResponse.properties.data).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should handle generic array types', () => {
            const files = [
                `${fixtures}/complex/generic-types/api.ts`,
                `${fixtures}/complex/generic-types/response.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('UserListResponse')
            const userListResponse = result.components.schemas.UserListResponse as any
            expect(userListResponse.properties.items).toEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/User',
                },
            })
        })
    })

    describe('Circular References', () => {
        test('should handle circular type references', () => {
            const files = [
                `${fixtures}/complex/circular-refs/api.ts`,
                `${fixtures}/complex/circular-refs/user.ts`,
                `${fixtures}/complex/circular-refs/post.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have both types
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('Post')
        })

        test('should use $ref for circular references', () => {
            const files = [
                `${fixtures}/complex/circular-refs/api.ts`,
                `${fixtures}/complex/circular-refs/user.ts`,
                `${fixtures}/complex/circular-refs/post.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const user = result.components.schemas.User as any
            const post = result.components.schemas.Post as any

            // User.posts should reference Post
            expect(user.properties.posts).toEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Post',
                },
            })

            // Post.author should reference User
            expect(post.properties.author).toEqual({
                $ref: '#/components/schemas/User',
            })
        })
    })

    describe('Utility Types', () => {
        test('should resolve Omit utility type', () => {
            const files = [
                `${fixtures}/complex/utility-types/api.ts`,
                `${fixtures}/complex/utility-types/base.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('PublicUser')
            const publicUser = result.components.schemas.PublicUser as any

            // Should have all User properties except password
            expect(publicUser.properties).toHaveProperty('id')
            expect(publicUser.properties).toHaveProperty('name')
            expect(publicUser.properties).toHaveProperty('email')
            expect(publicUser.properties).not.toHaveProperty('password')
        })

        test('should resolve Pick utility type', () => {
            const files = [
                `${fixtures}/complex/utility-types/api.ts`,
                `${fixtures}/complex/utility-types/base.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('CreateUserRequest')
            const createRequest = result.components.schemas.CreateUserRequest as any

            // Should only have picked properties
            expect(createRequest.properties).toHaveProperty('name')
            expect(createRequest.properties).toHaveProperty('email')
            expect(createRequest.properties).toHaveProperty('password')
            expect(createRequest.properties).not.toHaveProperty('id')
            expect(createRequest.properties).not.toHaveProperty('createdAt')
        })

        test('should resolve Partial utility type', () => {
            const files = [
                `${fixtures}/complex/utility-types/api.ts`,
                `${fixtures}/complex/utility-types/base.ts`,
            ]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('UpdateUserRequest')
            const updateRequest = result.components.schemas.UpdateUserRequest as any

            // Should have properties but all optional
            expect(updateRequest.properties).toHaveProperty('name')
            expect(updateRequest.properties).toHaveProperty('email')

            // Required array should be empty or not include these properties
            if (updateRequest.required) {
                expect(updateRequest.required).not.toContain('name')
                expect(updateRequest.required).not.toContain('email')
            }
        })
    })
})
