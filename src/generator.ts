// Currently we do not support full typesafety without using any because:
// - With full typesafety we probably will be forced to recreate every request object from scratch.
// - It would be too complicated.
// So we are relying on tests here.
import * as jsdocParser from '@/jsdoc-parser/parser'
import * as tsParser from '@/typescript-parser/parse'
import * as openApiV30 from '@/openapi-converter/openapi-3.0'
import * as openApiV31 from '@/openapi-converter/openapi-3.1'
import ts from 'typescript'
import { isTypeReference, type TypeReference } from '@/common/type-reference'
import * as tsNodes from '@/typescript-parser/nodes'
import type { Request } from './jsdoc-parser/openapi-paths'

export enum OpenApiVersion {
    v30 = '3.0.0',
    v31 = '3.1.0',
}

interface OpenApiDocument<T> {
    openapi: string
    paths: Record<string, Record<string, Request<T>>>
    components: {
        schemas: Record<string, T>
    }
}

export function generateOpenApiDoc(
    files: string[],
    version: OpenApiVersion.v30,
): OpenApiDocument<openApiV30.Node>

export function generateOpenApiDoc(
    files: string[],
    version: OpenApiVersion.v31,
): OpenApiDocument<openApiV31.Node>

export function generateOpenApiDoc(files: string[], version: OpenApiVersion) {
    const program = ts.createProgram(files, {
        allowJs: true,
        checkJs: true,
        target: ts.ScriptTarget.ESNext,
    })

    const components: Record<string, tsNodes.Node> = {}

    const unresolvedPaths: Record<string, Record<string, jsdocParser.Request>> = {}
    for (const file of files) {
        const paths = jsdocParser.parsePaths(file)
        Object.assign(unresolvedPaths, paths)
    }

    const resolvedPaths: Record<
        string,
        Record<string, Request<openApiV30.Node | openApiV31.Node>>
    > = {}
    for (const path in unresolvedPaths) {
        if (!resolvedPaths[path]) resolvedPaths[path] = {}

        for (const method in unresolvedPaths[path]) {
            const req = unresolvedPaths[path][method]!
            resolvedPaths[path]![method] = resolveRequest(req, program, components, version)
        }
    }

    const resolvedComponents: Record<string, openApiV30.Node | openApiV31.Node> = {}
    for (const component in components) {
        resolvedComponents[component] = tsNodeToOpenApi(components[component]!, version)
    }

    const document: OpenApiDocument<openApiV31.Node | openApiV30.Node> = {
        openapi: version,
        paths: resolvedPaths,
        components: {
            schemas: resolvedComponents,
        },
    }
    return document
}

function resolveRequest(
    req: jsdocParser.Request,
    program: ts.Program,
    components: Record<string, any>,
    version: OpenApiVersion,
): Request<any> {
    // Resolve params
    if (req.parameters) {
        for (let i = 0; i < req.parameters.length; i++) {
            const param = req.parameters[i]!
            if (!isTypeReference(param.schema)) continue

            req.parameters[i]!.schema = resolveTypeReference(
                param.schema,
                program,
                components,
                version,
            )
        }
    }

    // Resolve request body
    if (req.requestBody) {
        for (const contentType in req.requestBody.content) {
            const content = req.requestBody.content[contentType]!
            if (!isTypeReference(content.schema)) continue

            const resolved = resolveTypeReference(content.schema, program, components, version)
            req.requestBody.content[contentType]!.schema = resolved
        }
    }

    // Resolve responses
    if (req.responses) {
        for (const code in req.responses) {
            const resp = req.responses[code]!

            for (const contentType in resp.content) {
                const content = resp.content[contentType]!
                if (!isTypeReference(content.schema)) continue

                const resolved = resolveTypeReference(content.schema, program, components, version)
                req.responses[code]!.content![contentType]!.schema = resolved
            }
        }
    }

    return req
}

function resolveTypeReference(
    ref: TypeReference,
    program: ts.Program,
    components: Record<string, any>,
    version: OpenApiVersion,
): any {
    const resolvePrimitiveOrFormat =
        version === OpenApiVersion.v30
            ? openApiV30.resolvePrimitiveOrFormat
            : openApiV31.resolvePrimitiveOrFormat

    const resolved = resolvePrimitiveOrFormat(ref.$tsType)

    if (resolved) {
        return resolved
    }

    const tree = tsParser.parse(program, components, ref.$fileName, ref.$tsType)

    if (!tree) {
        throw new Error(`Cannot resolve type: ${ref.$tsType} in ${ref.$fileName}`)
    }

    const openApiNode = tsNodeToOpenApi(tree, version)

    return openApiNode
}

function tsNodeToOpenApi(node: tsNodes.Node, version: OpenApiVersion) {
    const treeToOpenApi =
        version === OpenApiVersion.v30 ? openApiV30.treeToOpenApi : openApiV31.treeToOpenApi
    return treeToOpenApi(node)
}
