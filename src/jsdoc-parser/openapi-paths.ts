export type Ref = {
    $ref: string
}

export interface Param<T> {
    name: string
    in: string
    description?: string
    required?: boolean
    schema: T | Ref
}

export type Content<T> = {
    schema?: T | Ref
}

export interface Response<T> {
    description: string
    content?: Record<string, Content<T>>
}

export interface RequestBody<T> {
    content?: Record<string, Content<T>>
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
