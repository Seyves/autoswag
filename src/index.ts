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
import type * as tsNodes from '@/typescript-parser/nodes'
import type { Request } from './jsdoc-parser/openapi-paths'
import { globSync } from 'tinyglobby'
import path from 'path'
import { AutoswagError } from './common/errors'
export { AutoswagError } from './common/errors'

export enum OpenApiVersion {
    v30 = '3.0.0',
    v31 = '3.1.0',
}

interface Config<V extends OpenApiVersion> {
    /** Where to search for source files (array of glob patterns) */
    source: string[]
    /** Base openapi document */
    baseDoc?: any
    /** Version of Openapi, defaults to 3.1.0 */
    version?: V
    /** Override you project typescript config */
    compilerOptions?: ts.CompilerOptions
    /** Debug mode for verbose logging */
    debug?: boolean
}

interface OpenApiDocument<T> {
    openapi: string
    paths: Record<string, Record<string, Request<T>>>
    components: {
        schemas: Record<string, T>
    }
}

interface GeneratorContext {
    program: ts.Program
    rawComponents: Record<string, tsNodes.Node>
    version: OpenApiVersion
    debug?: boolean
}

export function generate(config: Config<OpenApiVersion.v30>): OpenApiDocument<openApiV30.Node>

export function generate(config: Config<OpenApiVersion.v31>): OpenApiDocument<openApiV31.Node>

export function generate(config: Config<OpenApiVersion>) {
    const files = globSync(config.source)

    const ctx: GeneratorContext = {
        version: config.version || OpenApiVersion.v31,
        program: ts.createProgram(files, config.compilerOptions || getProjectTSOptions()),
        rawComponents: {},
        debug: Boolean(config.debug),
    }

    const rawPaths: Record<string, Record<string, jsdocParser.Request>> = {}
    for (const file of files) {
        const paths = jsdocParser.parsePaths(file)
        Object.assign(rawPaths, paths)
    }

    const paths: Record<string, Record<string, Request<openApiV30.Node | openApiV31.Node>>> = {}
    for (const path in rawPaths) {
        if (!paths[path]) paths[path] = {}

        for (const method in rawPaths[path]) {
            const req = rawPaths[path][method]!
            paths[path]![method] = resolveRequest(ctx, req)
        }
    }

    let components: Record<string, openApiV30.Node | openApiV31.Node> = {}
    for (const component in ctx.rawComponents) {
        components[component] = tsNodeToOpenApi(ctx.rawComponents[component]!, ctx.version)
    }

    let document: OpenApiDocument<openApiV31.Node | openApiV30.Node> = {
        openapi: ctx.version,
        paths: paths,
        components: {
            schemas: components,
        },
    }

    // Deep merge would be overkill here
    if (config.baseDoc) {
        const baseDoc = structuredClone(config.baseDoc)
        document = { ...document, ...baseDoc }

        if (config.baseDoc.components) {
            document.components = { ...document.components, ...baseDoc.components }

            if (config.baseDoc.components.schemas) {
                document.components.schemas = {
                    ...document.components.schemas,
                    ...baseDoc.components.schemas,
                }
            }
        }
    }

    return document
}

function resolveRequest(ctx: GeneratorContext, req: jsdocParser.Request): Request<any> {
    // Resolve params
    if (req.parameters) {
        for (let i = 0; i < req.parameters.length; i++) {
            const param = req.parameters[i]!
            if (!isTypeReference(param.schema)) continue

            req.parameters[i]!.schema = resolveTypeReference(ctx, param.schema)
        }
    }

    // Resolve request body
    if (req.requestBody) {
        for (const contentType in req.requestBody.content) {
            const content = req.requestBody.content[contentType]!
            if (!isTypeReference(content.schema)) continue

            const resolved = resolveTypeReference(ctx, content.schema)
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

                const resolved = resolveTypeReference(ctx, content.schema)
                req.responses[code]!.content![contentType]!.schema = resolved
            }
        }
    }

    return req
}

function resolveTypeReference(ctx: GeneratorContext, ref: TypeReference): any {
    const resolvePrimitiveOrFormat =
        ctx.version === OpenApiVersion.v30
            ? openApiV30.resolvePrimitiveOrFormat
            : openApiV31.resolvePrimitiveOrFormat

    const resolved = resolvePrimitiveOrFormat(ref.$tsType)

    if (resolved) {
        return resolved
    }

    let tree: tsNodes.Node | undefined
    if (ref.$isExpr) {
        tree = tsParser.parseTypeExpression(
            ctx.program,
            ctx.rawComponents,
            ref.$fileName,
            ref.$tsType,
            ref.$position,
            ctx.debug,
        )
    } else {
        tree = tsParser.parse(ctx.program, ctx.rawComponents, ref.$fileName, ref.$tsType, ctx.debug)
    }

    if (!tree) {
        console.log(`${ref.$fileName}:${ref.$position.join(':')}`)
        throw new AutoswagError(
            `Cannot find type: '${ref.$tsType}'`,
            `${ref.$fileName}:${ref.$position.join(':')}`,
        )
    }

    const openApiNode = tsNodeToOpenApi(tree, ctx.version)

    return openApiNode
}

function tsNodeToOpenApi(node: tsNodes.Node, version: OpenApiVersion) {
    const treeToOpenApi =
        version === OpenApiVersion.v30 ? openApiV30.treeToOpenApi : openApiV31.treeToOpenApi
    return treeToOpenApi(node)
}

export function getProjectTSOptions(): ts.CompilerOptions {
    let cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json')
    if (!cfgPath) {
        cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'jsconfig.json')
    }
    if (!cfgPath) {
        throw new Error('Cannot find tsconfig.json or jsconfig.json in the project')
    }
    const configFile = ts.readConfigFile(cfgPath, ts.sys.readFile)

    const parsed = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        path.dirname(cfgPath),
        undefined,
        cfgPath,
    )
    return parsed.options
}
