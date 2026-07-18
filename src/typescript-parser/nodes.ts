import type { Meta } from './tags'

export enum Kind {
    Undefined,
    Null,
    String,
    Number,
    Boolean,
    Object,
    Array,
    Tuple,
    Union,
    Enum,
    Record,
    Component,
    Unknown,
}

interface Base {
    info?: Meta
}

export interface Primitive extends Base {
    type: Kind.Undefined | Kind.Null | Kind.String | Kind.Number | Kind.Boolean
}

export interface Object extends Base {
    type: Kind.Object
    properties: Record<string, Node>
    required: string[]
}

export interface Union extends Base {
    type: Kind.Union
    oneOf: Node[]
}

export interface Tuple extends Base {
    type: Kind.Tuple
    items: Node[]
    minItems: number
    maxItems: number
}

export interface Enum extends Base {
    type: Kind.Enum
    values: string[] | number[]
}

export interface Indexed extends Base {
    type: Kind.Record
    items: Node
}

export interface Array extends Base {
    type: Kind.Array
    items: Node
}

export interface Component extends Base {
    type: Kind.Component
    ref: string
}

export interface Unknown extends Base {
    type: Kind.Unknown
}

export type Node = Primitive | Object | Tuple | Union | Enum | Indexed | Array | Unknown | Component
