export type StaticSchema = {
    schema: { $ref: string }
}

export interface Param<T> {
    name: string
    in: string
    description?: string
    required?: boolean
    schema: T | StaticSchema['schema']
}

export interface Response<T> {
    description: string
    content?: Record<string, T | StaticSchema | Record<PropertyKey, never>>
}

export interface RequestBody<T> {
    content?: Record<string, T | StaticSchema | Record<PropertyKey, never>>
    description?: string
    required?: boolean
}

export interface Server {
    url: string
    description?: string
}

export type Security = Record<string, string[]>[]

export interface ExternalDocs {
    url: string
    description?: string
}

export interface Request<T> {
    security?: Security
    operationId?: string
    deprecated?: boolean
    servers?: Server[]
    summary?: string
    externalDocs?: ExternalDocs
    tags?: string[]
    parameters?: Param<T>[]
    responses?: Record<string, Response<T>>
    requestBody?: RequestBody<T>
}
