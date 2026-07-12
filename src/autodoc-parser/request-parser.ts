import { AutodocError, getLocationFromLine } from '@/common/errors'
import * as commentParser from 'comment-parser'
import fs from 'fs'

enum Tags {
    Autodoc = 'autodoc',
    Security = 'security',
    OperationId = 'operationId',
    Deprecated = 'deprecated',
    Server = 'server',
    Summary = 'summary',
    ExternalDocs = 'externalDocs',
    Tag = 'tag',
    PathParam = 'pathParam',
    QueryParam = 'queryParam',
    HeaderParam = 'headerParam',
    CookieParam = 'cookieParam',
    Request = 'request',
    Accept = 'accept',
    Response = 'response',
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']

const primitiveTypes = ['boolean', 'integer', 'number', 'string']

const formatToType: Record<string, string> = {
    base64url: 'string',
    binary: 'string',
    byte: 'string',
    char: 'string',
    commonmark: 'string',
    'date-time-local': 'string',
    'date-time': 'string',
    date: 'string',
    decimal: 'number',
    decimal128: 'number',
    'double-int': 'number',
    double: 'number',
    duration: 'string',
    email: 'string',
    float: 'number',
    hostname: 'string',
    html: 'string',
    'http-date': 'string',
    'idn-email': 'string',
    'idn-hostname': 'string',
    int16: 'number',
    int32: 'number',
    int64: 'number',
    int8: 'number',
    'ipv4-cidr': 'string',
    ipv4: 'string',
    'ipv6-cidr': 'string',
    ipv6: 'string',
    'iri-reference': 'string',
    iri: 'string',
    'json-pointer': 'string',
    language: 'string',
    'media-range': 'string',
    password: 'string',
    regex: 'string',
    'relative-json-pointer': 'string',
    'sf-binary': 'string',
    'sf-boolean': 'string',
    'sf-decimal': 'string',
    'sf-integer': 'number',
    'sf-string': 'string',
    'sf-token': 'string',
    'time-local': 'string',
    time: 'string',
    uint16: 'number',
    uint32: 'number',
    uint64: 'number',
    uint8: 'number',
    unixtime: 'number',
    'uri-reference': 'string',
    'uri-template': 'string',
    uri: 'string',
    uuid: 'string',
}

export enum SchemaType {
    Predefined,
    TsDefinition,
}

type PredefinedRef = {
    type: SchemaType.Predefined
    ref: string
}

type TsTypeDefinition = {
    type: SchemaType.TsDefinition
    name: string
}

type PrimitiveDefinition = {
    type: string
    format?: string
}

type OpenApiSchema = PredefinedRef | TsTypeDefinition

interface OpenApiParam {
    name: string
    in: string
    description?: string
    required?: boolean
    schema: PrimitiveDefinition | OpenApiSchema
}

type OpenApiContent =
    | PrimitiveDefinition
    | {
          schema?: OpenApiSchema
      }

interface OpenApiResponse {
    description: string
    content?: Record<string, OpenApiContent>
}

interface OpenApiServer {
    url: string
    description?: string
}

interface OpenApiExternalDocs {
    url: string
    description?: string
}

type OpenApiSecurity = Record<string, string[]>[]

type OpenApiRequestBody = {
    content: Record<string, OpenApiContent>
    description?: string
    required?: boolean
}

interface OpenApiRequest {
    security?: OpenApiSecurity
    operationId?: string
    deprecated?: boolean
    servers?: OpenApiServer[]
    summary?: string
    externalDocs?: OpenApiExternalDocs
    tags?: string[]
    parameters?: OpenApiParam[]
    responses?: Record<string, OpenApiResponse>
    requestBody?: OpenApiRequestBody
}

/**
 * Used to parse formats like <httpCode> or <httpCode>.<contentType>.
 * @example 400.application/json
 * @example 200
 */
const responseNameFormatRegex = /^(\d+)(\.)?(\S+)?$/

/**
 * Used to parse type references.
 * Reference could be prefixed with 'ref' to tell
 * that a type is predefined manually in the components.schemas
 * and we don't need to parse Typescript defenitions
 * @example ref.MultipartRequest
 * @example User
 * @example string
 */
const tagTypeFormatRegex = /^(ref:)?([a-zA-Z0-9_]+)?$/

export function getPathsFromFile(fileName: string) {
    const file = fs.readFileSync(fileName)
    const contents = file.toString()
    const parsed = commentParser.parse(contents)

    const paths: Record<string, Record<string, OpenApiRequest>> = {}

    for (const block of parsed) {
        // Skipping blocks with no @request tag
        if (block.tags.every((tag) => tag.tag !== Tags.Autodoc)) {
            continue
        }

        const [path, method, request] = parseAutodocBlock(block, fileName)
        if (!paths.hasOwnProperty(path)) paths[path] = {}
        paths[path]![method] = request
    }

    return paths
}

export class CommentParserError extends Error {
    name: string
    location: string
    constructor(message: string, location: string) {
        super(message)
        this.name = 'CommentParserError'
        this.location = location
    }
}

function parseAutodocBlock(
    block: commentParser.Block,
    fileName: string,
): [string, string, OpenApiRequest] {
    const autodocTag = block.tags.find((tag) => tag.tag === Tags.Autodoc)!

    if (!httpMethods.includes(autodocTag.name)) {
        throw new AutodocError(
            `@autodoc tag contains invalid request method: "${autodocTag.name}"`,
            getLocationFromLine(fileName, autodocTag.source),
        )
    }

    if (!autodocTag.description) {
        throw new AutodocError(
            '@autodoc tag has no path specified',
            getLocationFromLine(fileName, autodocTag.source),
        )
    }

    const request: OpenApiRequest = {}

    for (const tag of block.tags) {
        switch (tag.tag) {
            case Tags.Security:
                // TODO: There is no way to define AND security schemas for now.
                // But i think it is a pretty rare case.
                if (!request.security) request.security = []
                request.security.push({
                    [tag.name]: tag.description.split(' '),
                })
                break

            case Tags.OperationId:
                request.operationId = tag.name
                break

            case Tags.Deprecated:
                request.deprecated = true
                break

            case Tags.Server:
                if (!request.servers) request.servers = []
                const server: OpenApiServer = { url: tag.name }
                if (tag.description) server.description = tag.description
                request.servers.push(server)
                break

            case Tags.Summary:
                request.summary = [tag.name, tag.description].join(' ')
                break

            case Tags.ExternalDocs:
                const docs: OpenApiExternalDocs = { url: tag.name }
                if (tag.description) docs.description = tag.description
                request.externalDocs = docs
                break

            case Tags.Tag:
                request.tags = [tag.name]
                break

            case Tags.PathParam: {
                if (!request.parameters) request.parameters = []
                const param: OpenApiParam = {
                    in: 'path',
                    name: tag.name,
                    required: true,
                    schema: contentToParamSchema(getContentFromTagType(fileName, tag)),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.QueryParam: {
                if (!request.parameters) request.parameters = []
                const param: OpenApiParam = {
                    in: 'query',
                    name: tag.name,
                    required: !tag.optional,
                    schema: contentToParamSchema(getContentFromTagType(fileName, tag)),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.HeaderParam: {
                if (!request.parameters) request.parameters = []
                const param: OpenApiParam = {
                    in: 'header',
                    name: tag.name,
                    required: !tag.optional,
                    schema: contentToParamSchema(getContentFromTagType(fileName, tag)),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }
            case Tags.CookieParam: {
                if (!request.parameters) request.parameters = []
                const param: OpenApiParam = {
                    in: 'cookie',
                    name: tag.name,
                    required: !tag.optional,
                    schema: contentToParamSchema(getContentFromTagType(fileName, tag)),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.Request:
                if (block.tags.every((tag) => tag.tag !== Tags.Accept)) {
                    throw new AutodocError(
                        `@request tag cannot be specified without @accept tags`,
                        getLocationFromLine(fileName, tag.source),
                    )
                }
                if (!request.requestBody) request.requestBody = { content: {} }

                if (tag.description) {
                    request.requestBody.description = tag.description
                }

                switch (tag.name) {
                    case 'optional':
                        request.requestBody.required = false
                        break
                    case 'required':
                        request.requestBody.required = true
                        break
                    default:
                        throw new AutodocError(
                            `@request tag should contain "optional" or "required" right after declaration`,
                            getLocationFromLine(fileName, tag.source),
                        )
                }
                break

            case Tags.Accept: {
                if (!request.requestBody) {
                    request.requestBody = { content: {} }
                }

                let contentType = tag.name

                if (tag.type && !contentType) {
                    contentType = 'application/json'
                }

                if (tag.type) {
                    request.requestBody.content[contentType] = getContentFromTagType(fileName, tag)
                } else {
                    request.requestBody.content[contentType] = {}
                }
                break
            }

            case Tags.Response:
                if (!request.responses) request.responses = {}

                if (!tag.description) {
                    throw new AutodocError(
                        '@response tag should contain description',
                        getLocationFromLine(fileName, tag.source),
                    )
                }
                const response: OpenApiResponse = {
                    description: tag.description,
                }

                const match = tag.name.match(responseNameFormatRegex)
                if (!match) {
                    throw new AutodocError(
                        `@response tag should contain expression <httpCode> or <httpCode>.<contentType> right after declaration`,
                        getLocationFromLine(fileName, tag.source),
                    )
                }
                const code = parseInt(match[1] as string)
                if (isNaN(code)) {
                    throw new AutodocError(
                        `@response tag contain invalid response code`,
                        getLocationFromLine(fileName, tag.source),
                    )
                }

                let contentType = match[3]

                if (tag.type && !contentType) {
                    contentType = 'application/json'
                }

                if (contentType) {
                    if (!response.content) response.content = {}
                    if (tag.type) {
                        response.content[contentType] = getContentFromTagType(fileName, tag)
                    } else {
                        response.content[contentType] = {}
                    }
                }

                request.responses[code] = response
                break
        }
    }

    return [autodocTag.description, autodocTag.name.toLowerCase(), request]
}

function getContentFromTagType(fileName: string, tag: commentParser.Spec): OpenApiContent {
    const match = tag.type.match(tagTypeFormatRegex)
    if (!match) {
        throw new AutodocError(
            `@${tag.tag} tag contains invalid type reference: "${tag.type}"`,
            getLocationFromLine(fileName, tag.source),
        )
    }

    if (match[1]) {
        return {
            schema: {
                type: SchemaType.Predefined,
                ref: `#/components/schemas/${match[2]}`,
            },
        }
    }

    const type = match[0]
    if (formatToType.hasOwnProperty(type)) {
        return {
            format: type,
            type: formatToType[type]!,
        }
    }

    if (primitiveTypes.includes(type)) {
        return {
            type: type,
        }
    }

    return {
        schema: {
            type: SchemaType.TsDefinition,
            name: match[0],
        },
    }
}

function contentToParamSchema(content: OpenApiContent): PrimitiveDefinition | OpenApiSchema {
    if ('schema' in content) {
        return content.schema
    }
    //@ts-ignore
    return content
}
