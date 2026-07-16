import ts from 'typescript'

export function hasTypeFlags(type: ts.Type, flags: ts.TypeFlags[]) {
    return flags.some((f) => type.flags & f)
}

export function hasSymbolFlags(symbol: ts.Symbol, flags: ts.SymbolFlags[]) {
    return flags.some((f) => symbol.flags & f)
}

export function isUserDefinedType(symbol: ts.Symbol) {
    return hasSymbolFlags(symbol, [
        ts.SymbolFlags.TypeAlias,
        ts.SymbolFlags.Interface,
        ts.SymbolFlags.Class,
    ])
}

export function isJSDocTypedef(symbol: ts.Symbol): boolean {
    return Boolean(
        symbol.declarations &&
        symbol.declarations.length &&
        // @ts-ignore
        // For some reason this function does not
        // exists in declared public API.
        // But it works ¯\_(ツ)_/¯.
        ts.isJSDocTypeAlias(symbol.declarations[0]),
    )
}

export function isUnionOptional(union: ts.UnionType) {
    return union.types.some((t) => t.flags & ts.TypeFlags.Undefined)
}

export function resolveOptionalUnionProp(union: ts.UnionType): ts.Type {
    const members = union.types.filter((t) => !(t.flags & ts.TypeFlags.Undefined))

    // If property is just optional
    if (members.length === 1) {
        return members[0] as ts.Type
        // If property is optional and a union
    } else {
        // WARN: Mutation can cause problems, but not sure
        union.types = members
        return union
    }
}
