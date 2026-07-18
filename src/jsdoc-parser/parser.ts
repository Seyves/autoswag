import { AutodocError, getLocationFromLine } from '@/common/errors'
import * as commentParser from 'comment-parser'
import fs from 'fs'
import * as openApiPaths from '@/jsdoc-parser/openapi-paths'
import type { TypeReference } from '@/common/type-reference'

export type Request = openApiPaths.Request<TypeReference>

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
    Body = 'body',
    Accept = 'accept',
    Response = 'response',
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']

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
const tagTypeFormatRegex = /^(ref:)?([a-zA-Z0-9_-]+)?$/

export function parsePaths(fileName: string) {
    const file = fs.readFileSync(fileName)
    const contents = file.toString()
    const parsed = commentParser.parse(contents)

    const paths: Record<string, Record<string, openApiPaths.Request<TypeReference>>> = {}

    for (const block of parsed) {
        // Skipping blocks with no @autodoc tag
        if (block.tags.every((tag) => tag.tag !== Tags.Autodoc)) {
            continue
        }

        const [path, method, request] = parseJSDocBlock(fileName, block)
        if (!paths.hasOwnProperty(path)) paths[path] = {}
        paths[path]![method] = request
    }

    return paths
}

function parseJSDocBlock(
    fileName: string,
    block: commentParser.Block,
): [string, string, openApiPaths.Request<TypeReference>] {
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

    const request: openApiPaths.Request<TypeReference> = {}

    for (const tag of block.tags) {
        switch (tag.tag) {
            case Tags.Security:
                // TODO: There is no way to define AND security schemas for now.
                // But i think it is a pretty rare case.
                if (!request.security) request.security = []
                request.security.push({
                    [tag.name]: tag.description ? tag.description.split(' ') : [],
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
                const server: openApiPaths.Server = { url: tag.name }
                if (tag.description) server.description = tag.description
                request.servers.push(server)
                break

            case Tags.Summary:
                request.summary = [tag.name, tag.description].join(' ')
                break

            case Tags.ExternalDocs:
                const docs: openApiPaths.ExternalDocs = { url: tag.name }
                if (tag.description) docs.description = tag.description
                request.externalDocs = docs
                break

            case Tags.Tag:
                request.tags = [tag.name]
                break

            case Tags.PathParam: {
                if (!request.parameters) request.parameters = []
                const param: openApiPaths.Param<TypeReference> = {
                    in: 'path',
                    name: tag.name,
                    required: true,
                    schema: getContentFromTagType(fileName, tag),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.QueryParam: {
                if (!request.parameters) request.parameters = []
                const param: openApiPaths.Param<TypeReference> = {
                    in: 'query',
                    name: tag.name,
                    required: !tag.optional,
                    schema: getContentFromTagType(fileName, tag),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.HeaderParam: {
                if (!request.parameters) request.parameters = []
                const param: openApiPaths.Param<TypeReference> = {
                    in: 'header',
                    name: tag.name,
                    required: !tag.optional,
                    schema: getContentFromTagType(fileName, tag),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }
            case Tags.CookieParam: {
                if (!request.parameters) request.parameters = []
                const param: openApiPaths.Param<TypeReference> = {
                    in: 'cookie',
                    name: tag.name,
                    required: !tag.optional,
                    schema: getContentFromTagType(fileName, tag),
                }
                if (tag.description) {
                    param.description = tag.description
                }
                request.parameters.push(param)
                break
            }

            case Tags.Body:
                if (block.tags.every((tag) => tag.tag !== Tags.Accept)) {
                    throw new AutodocError(
                        `@body tag cannot be specified without @accept tags`,
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
                            `@body tag should contain "optional" or "required" right after declaration`,
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
                    request.requestBody.content![contentType] = {
                        schema: getContentFromTagType(fileName, tag),
                    }
                } else {
                    request.requestBody.content![contentType] = {}
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
                const response: openApiPaths.Response<TypeReference> = {
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
                        response.content[contentType] = {
                            schema: getContentFromTagType(fileName, tag),
                        }
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

function getContentFromTagType(
    fileName: string,
    tag: commentParser.Spec,
): openApiPaths.Ref | TypeReference {
    const match = tag.type.match(tagTypeFormatRegex)
    if (!match) {
        throw new AutodocError(
            `@${tag.tag} tag contains invalid type reference: "${tag.type}"`,
            getLocationFromLine(fileName, tag.source),
        )
    }
    if (match[1]) {
        return {
            $ref: `#/components/schemas/${match[2]}`,
        }
    }
    return { $tsType: match[0], $fileName: fileName }
}
