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
import path from 'path'
import { AutoswagError } from '@/common/errors'
import { OpenApiVersion, type BaseConfig } from '@/config'
import { globSync } from 'tinyglobby'

export { AutoswagError } from '@/common/errors'
export {
    type Config,
    type BaseConfig,
    type DocumentConfig,
    OpenApiVersion,
    OpenApiFormat,
} from '@/config'

interface OpenApiDocument<T> {
    openapi: string
    paths: Record<string, Record<string, Request<T>>>
    components: {
        schemas: Record<string, T>
    }
}

type RawComponents = Record<string, tsNodes.Node>

type VersionToNode = {
    [OpenApiVersion.v30]: openApiV30.Node
    [OpenApiVersion.v31]: openApiV31.Node
}

/**
 * Creation of a class provides an easy way to share
 * ts.Program between multiple build calls for better performance.
 */
export class Generator<V extends OpenApiVersion> {
    #config: BaseConfig<V>
    #program: ts.Program

    constructor(config: BaseConfig<V>) {
        const options = config.compilerOptions || getProjectTSOptions()
        this.#program = ts.createProgram([], options)
        this.#config = config
    }

    build(
        source: string[],
        root: any = {},
        components: any = {},
    ): OpenApiDocument<VersionToNode[V]> {
        root = structuredClone(root)
        components = structuredClone(components)

        const files = [...new Set([...globSync(source), ...this.#program.getRootFileNames()])]
        this.#program = ts.createProgram(
            files,
            this.#program.getCompilerOptions(),
            undefined,
            this.#program,
        )

        const rawPaths: Record<string, Record<string, jsdocParser.Request>> = {}
        for (const file of files) {
            const paths = jsdocParser.parsePaths(file)
            Object.assign(rawPaths, paths)
        }

        const rawComponents: RawComponents = {}
        const paths: Record<string, Record<string, Request<openApiV30.Node | openApiV31.Node>>> = {}
        for (const path in rawPaths) {
            if (!paths[path]) paths[path] = {}

            for (const method in rawPaths[path]) {
                const req = rawPaths[path][method]!
                paths[path]![method] = this.#resolveRequest(rawComponents, req)
            }
        }

        let resComponents: Record<string, openApiV30.Node | openApiV31.Node> = {}
        for (const component in rawComponents) {
            resComponents[component] = this.#tsNodeToOpenApi(rawComponents[component]!)
        }

        delete root.version

        let document: OpenApiDocument<openApiV31.Node | openApiV30.Node> = {
            openapi: this.version,
            ...root,
            components: {
                ...components,
                schemas: resComponents,
            },
            paths: paths,
        }

        if (components.schemas) {
            document.components.schemas = {
                ...components.schemas,
                ...document.components.schemas,
            }
        }
        // @ts-ignore
        return document
    }

    #resolveRequest(components: RawComponents, req: jsdocParser.Request): Request<any> {
        // Resolve params
        if (req.parameters) {
            for (let i = 0; i < req.parameters.length; i++) {
                const param = req.parameters[i]!
                if (!isTypeReference(param.schema)) continue

                req.parameters[i]!.schema = this.#resolveTypeReference(components, param.schema)
            }
        }

        // Resolve request body
        if (req.requestBody) {
            for (const contentType in req.requestBody.content) {
                const content = req.requestBody.content[contentType]!
                if (!isTypeReference(content.schema)) continue

                const resolved = this.#resolveTypeReference(components, content.schema)
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

                    const resolved = this.#resolveTypeReference(components, content.schema)
                    req.responses[code]!.content![contentType]!.schema = resolved
                }
            }
        }

        return req
    }

    #resolveTypeReference(components: RawComponents, ref: TypeReference): any {
        const resolved = this.#primitiveToOpenApi(ref.$tsType)
        if (resolved) {
            return resolved
        }

        let tree: tsNodes.Node | undefined
        if (ref.$isExpr) {
            tree = tsParser.parseTypeExpression(
                this.#program,
                components,
                ref.$fileName,
                ref.$tsType,
                ref.$position,
                this.debug,
            )
        } else {
            tree = tsParser.parse(this.#program, components, ref.$fileName, ref.$tsType, this.debug)
        }

        if (!tree) {
            console.log(`${ref.$fileName}:${ref.$position.join(':')}`)
            throw new AutoswagError(
                `Cannot find type: '${ref.$tsType}'`,
                `${ref.$fileName}:${ref.$position.join(':')}`,
            )
        }

        const openApiNode = this.#tsNodeToOpenApi(tree)

        return openApiNode
    }

    #tsNodeToOpenApi(node: tsNodes.Node) {
        if (this.version === OpenApiVersion.v30) {
            return openApiV30.treeToOpenApi(node)
        }
        return openApiV31.treeToOpenApi(node)
    }

    #primitiveToOpenApi(type: string) {
        if (this.version === OpenApiVersion.v30) {
            return openApiV30.resolvePrimitiveOrFormat(type)
        }
        return openApiV31.resolvePrimitiveOrFormat(type)
    }

    get version() {
        return this.#config.version || OpenApiVersion.v31
    }

    get debug() {
        return Boolean(this.#config.debug)
    }
}

export function getProjectTSOptions(): ts.CompilerOptions {
    let cfgPath: string | undefined

    for (const file of ['tsconfig.json', 'jsconfig.json']) {
        cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, file)
        if (cfgPath) break
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
