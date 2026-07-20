import { expect, test, describe } from 'vitest'
import { generate, OpenApiVersion } from '../../index'

describe('Generator - Basic Orchestration', () => {
    const fixtures = 'src/__tests__/generator/fixtures'

    describe('Single File Processing', () => {
        test('should generate OpenAPI document from single file', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({
                source: files,
                version: OpenApiVersion.v30,
            })

            expect(result).toHaveProperty('openapi', '3.0.0')
            expect(result).toHaveProperty('paths')
            expect(result).toHaveProperty('components')
            expect(result.components).toHaveProperty('schemas')
        })

        test('should have correct path structure', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.paths).toHaveProperty('/users/{id}')
            expect(result.paths['/users/{id}']).toHaveProperty('get')
        })

        test('should resolve TypeScript type to component', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas.User).toEqual({
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
                required: ['id', 'name', 'age'],
            })
        })

        test('should link response to component schema', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const response = result.paths['/users/{id}']!.get.responses![200]!
            expect(response.content!['application/json'].schema).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should resolve path parameters', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const params = result.paths['/users/{id}']!.get.parameters!
            expect(params).toHaveLength(1)
            expect(params[0]).toEqual({
                in: 'path',
                name: 'id',
                required: true,
                description: 'User ID',
                schema: { type: 'string' },
            })
        })
    })

    describe('Multiple Endpoints in Single File', () => {
        test('should process multiple autodoc blocks', () => {
            const files = [`${fixtures}/simple/multiple-endpoints.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.paths['/users']).toHaveProperty('get')
            expect(result.paths['/users']).toHaveProperty('post')
            expect(result.paths['/users/{id}']).toHaveProperty('get')
        })

        test('should create components for all used types', () => {
            const files = [`${fixtures}/simple/multiple-endpoints.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).toHaveProperty('CreateUserRequest')
        })
    })

    describe('Primitive Types', () => {
        test('should inline primitive types without creating components', () => {
            const files = [`${fixtures}/simple/primitives-only.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should have no components for primitives
            expect(Object.keys(result.components.schemas)).toHaveLength(0)

            // Should inline the type
            const requestBody = result.paths['/echo']!.post.requestBody!
            expect(requestBody.content!['text/plain'].schema).toEqual({ type: 'string' })

            const response = result.paths['/echo']!.post.responses![200]!
            expect(response.content!['application/json'].schema).toEqual({ type: 'string' })
        })

        test('should resolve format types correctly', () => {
            const files = [`${fixtures}/simple/with-formats.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const requestBody = result.paths['/users']!.post.requestBody!
            expect(requestBody.content!['application/json'].schema).toEqual({
                type: 'string',
                format: 'uuid',
            })

            const response = result.paths['/users']!.post.responses![200]!
            expect(response.content!['application/json'].schema).toEqual({
                type: 'string',
                format: 'date-time',
            })

            const params = result.paths['/users']!.post.parameters!
            expect(params[0]!.schema).toEqual({
                type: 'string',
                format: 'email',
            })
        })
    })

    describe('Mixed ref: and TypeScript Types', () => {
        test('should handle ref: prefixed schemas', () => {
            const files = [`${fixtures}/simple/mixed-refs-and-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(Object.keys(result.components.schemas)).toHaveLength(1)
            // TypeScript type should be resolved
            expect(result.components.schemas).toHaveProperty('User')

            // ref: type should be left as-is
            const requestBody = result.paths['/users']!.post.requestBody!
            expect(requestBody.content!['application/xml'].schema).toEqual({
                $ref: '#/components/schemas/LegacyUserFormat',
            })

            // User should be linked
            expect(requestBody.content!['application/json'].schema).toEqual({
                $ref: '#/components/schemas/User',
            })
        })

        test('should not create components for ref: prefixed types', () => {
            const files = [`${fixtures}/simple/mixed-refs-and-types.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Should only have User, not LegacyUserFormat
            expect(result.components.schemas).toHaveProperty('User')
            expect(result.components.schemas).not.toHaveProperty('LegacyUserFormat')
        })

        test('should handle imported type expressions', () => {
            const files = [`${fixtures}/simple/imported-type-expression.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const responseArr = result.paths['/users']!.get.responses![200]
            const contentArr = responseArr.content!['application/json']
            expect(contentArr.schema).toStrictEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/User',
                },
            })

            const responseMap = result.paths['/users/map']!.get.responses![200]
            const contentMap = responseMap.content!['application/json']
            expect(contentMap.schema).toStrictEqual({
                type: 'object',
                additionalProperties: {
                    $ref: '#/components/schemas/User',
                },
            })
        })

        test('should handle type expressions', () => {
            const files = [`${fixtures}/simple/type-expression.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const responseArr = result.paths['/users']!.get.responses![200]
            const contentArr = responseArr.content!['application/json']
            expect(contentArr.schema).toStrictEqual({
                type: 'array',
                items: {
                    $ref: '#/components/schemas/User',
                },
            })

            const responseMap = result.paths['/users/map']!.get.responses![200]
            const contentMap = responseMap.content!['application/json']
            expect(contentMap.schema).toStrictEqual({
                type: 'object',
                additionalProperties: {
                    $ref: '#/components/schemas/User',
                },
            })
        })
        test('should throw on invalid type expression', () => {
            const files = [`${fixtures}/simple/invalid-type-expression.ts`]
            expect(() => {
                generate({ source: files, version: OpenApiVersion.v30 })
            }).toThrow('Invalid type expression')
        })
    })

    describe('Empty and Edge Cases', () => {
        test('should handle files with no autodoc tags', () => {
            const files = [`${fixtures}/edge-cases/no-autodoc.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(Object.keys(result.paths)).toHaveLength(0)
            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })

        test('should handle empty files', () => {
            const files = [`${fixtures}/edge-cases/empty-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            expect(Object.keys(result.paths)).toHaveLength(0)
            expect(Object.keys(result.components.schemas)).toHaveLength(0)
        })

        test('should throw error for non-existent type', () => {
            const files = [`${fixtures}/edge-cases/type-not-found.ts`]

            expect(() => {
                generate({ source: files, version: OpenApiVersion.v30 })
            }).toThrow(`Cannot find type: 'NonExistentType'`)
        })
    })

    describe('Document Structure Validation', () => {
        test('should have valid OpenAPI 3.0 structure', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            // Required top-level fields
            expect(result.openapi).toBe('3.0.0')
            expect(typeof result.paths).toBe('object')
            expect(typeof result.components).toBe('object')
            expect(typeof result.components.schemas).toBe('object')
        })

        test('should have valid path item structure', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const pathItem = result.paths['/users/{id}']!
            expect(pathItem).toHaveProperty('get')
            expect(typeof pathItem.get).toBe('object')
        })

        test('should have valid operation structure', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const result = generate({ source: files, version: OpenApiVersion.v30 })

            const operation = result.paths['/users/{id}']!.get
            expect(operation).toBeDefined()

            // Optional fields that might be present
            if (operation.parameters) {
                expect(Array.isArray(operation.parameters)).toBe(true)
            }
            if (operation.responses) {
                expect(typeof operation.responses).toBe('object')
            }
        })
    })
})
