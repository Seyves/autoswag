import ts from 'typescript'

export const defaultFile = '.autoswagrc.cjs'

export enum OpenApiVersion {
    v30 = '3.0.0',
    v31 = '3.1.0',
}

export enum OpenApiFormat {
    yaml = 1,
    json,
}

export interface DocumentConfig {
    /**
     * Glob patterns that Autoswag uses to locate your source files.
     * You only need to include files containing JSDoc endpoint definitions.
     * Referenced types will still be resolved
     * as long as they are imported somewhere in your source code.
     */
    source: string[]
    /** Path for generated OpenAPI document. */
    output?: string
    /** Root-level OpenAPI document information */
    root?: any
    /** Manually defined OpenAPI components */
    components?: any
}

export interface BaseConfig<V extends OpenApiVersion> {
    /** Determines generated OpenAPI version. Defaults to 3.1.0. */
    version?: V
    /**
     * Override TypeScript compiler options.
     * If you override `compilerOptions`, you must provide complete options.
     * Partial overrides don't merge with tsconfig.json.
     */
    compilerOptions?: ts.CompilerOptions
    /** 
     * Determines the format of generated OpenAPI document.
     * Defaults to json.
     */
    format?: OpenApiFormat
    /** Changes tab width of the generated OpenAPI. Defaults to 2 */
    tabWidth?: number
    /** Enable verbose logging. */
    debug?: boolean
}

export type Config = BaseConfig<OpenApiVersion> & {
    documents: DocumentConfig[]
}

export function parse(rawCfg: any): Config {
    if (!rawCfg.hasOwnProperty('documents')) {
        throw new Error("missing 'documents' field")
    }
    if (!Array.isArray(rawCfg.documents)) {
        throw new Error("'documents' field must be an array")
    }

    for (let i = 0; i < rawCfg.documents.length; i++) {
        const document = rawCfg.documents[i]
        try {
            parseDocumentConfig(document)
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(`invalid 'document[${i}]': ${e.message}`)
            }
        }
    }

    if (rawCfg.hasOwnProperty('version') && !Object.values(OpenApiVersion).includes(rawCfg.version)) {
        throw new Error(`Unknown version ${rawCfg.version}, available: ${Object.values(OpenApiVersion)}`)
    }

    if (rawCfg.hasOwnProperty('format') && !Object.values(OpenApiFormat).includes(rawCfg.format)) {
        throw new Error(`Unknown format ${rawCfg.format}, available: ${Object.values(OpenApiFormat)}`)
    }

    if (rawCfg.hasOwnProperty('tabWidth') && typeof rawCfg.tabWidth !== 'number') {
        throw new Error("'tabWidth' field must be a number")
    }

    return rawCfg as Config
}

function parseDocumentConfig(docCfg: any): DocumentConfig {
    if (!isObject(docCfg)) {
        throw new Error('must be an object')
    }
    if (!docCfg.hasOwnProperty('source')) {
        throw new Error("missing 'source' field")
    }
    if (
        !Array.isArray(docCfg.source) ||
        docCfg.source.some((item: any) => typeof item !== 'string')
    ) {
        throw new Error("'source' field must be a string array")
    }

    if (!docCfg.hasOwnProperty('output')) {
        throw new Error("missing 'output' field")
    }
    if (typeof docCfg.output !== 'string') {
        throw new Error("'output' field must be a string")
    }

    if (docCfg.hasOwnProperty('root') && !isObject(docCfg.root)) {
        throw new Error("'root' field must be an object")
    }

    if (docCfg.hasOwnProperty('components') && !isObject(docCfg.components)) {
        throw new Error("'components' field must be an object")
    }

    return docCfg as DocumentConfig
}

function isObject(value: any) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
