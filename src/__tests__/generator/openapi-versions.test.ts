import { expect, test, describe } from 'vitest'
import { Generator, OpenApiVersion } from '../../index'

describe('Generator - OpenAPI Version Differences', () => {
    const fixtures = 'src/__tests__/generator/fixtures'

    describe('Version Field', () => {
        test('should set openapi field to 3.0.0 for v30', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const generator = new Generator({ version: OpenApiVersion.v30 })
            const result = generator.build(files)

            expect(result.openapi).toBe('3.0.0')
        })

        test('should set openapi field to 3.1.0 for v31', () => {
            const files = [`${fixtures}/simple/single-file.ts`]
            const generator = new Generator({ version: OpenApiVersion.v31 })
            const result = generator.build(files)

            expect(result.openapi).toBe('3.1.0')
        })
    })

    describe('Null Handling', () => {
        test('v3.0 should use nullable property for null types', () => {
            const files = [`${fixtures}/simple/single-file-with-nullable.ts`]
            const generator = new Generator({ version: OpenApiVersion.v30 })
            const result = generator.build(files)

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
            const generator = new Generator({ version: OpenApiVersion.v31 })
            const result = generator.build(files)

            const user = result.components.schemas.User as any
            const property = user.properties.name
            // In v3.1, null is represented with multitype
            expect(property).toEqual({
                types: ['null', 'string'],
            })
        })
    })

    describe('Complex Types Across Versions', () => {
        test('v3.1 should use multitype for primitives union', () => {
            const files = [`${fixtures}/edge-cases/primitives-union.ts`]
            const generator = new Generator({ version: OpenApiVersion.v31 })
            const result = generator.build(files)

            expect(result.components.schemas).toHaveProperty('User')
            const name = result.components.schemas.User.properties.name
            expect(name).toStrictEqual({
                types: ['string', 'number'],
            })
        })
        test('v3.0 should use oneOf for primitives union', () => {
            const files = [`${fixtures}/edge-cases/primitives-union.ts`]
            const generator = new Generator({ version: OpenApiVersion.v30 })
            const result = generator.build(files)

            expect(result.components.schemas).toHaveProperty('User')
            const name = result.components.schemas.User.properties.name
            expect(name).toStrictEqual({
                oneOf: [{ type: 'string' }, { type: 'number' }],
            })
        })
    })

    describe('Comprehensive Version Comparison', () => {
        test('should produce structurally similar but version-appropriate outputs', () => {
            const files = [
                `${fixtures}/cross-file/users/api.ts`,
                `${fixtures}/cross-file/users/types.ts`,
            ]
            let generator = new Generator({ version: OpenApiVersion.v30 })
            const result30 = generator.build(files)
            generator = new Generator({ version: OpenApiVersion.v31 })
            const result31 = generator.build(files)

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
