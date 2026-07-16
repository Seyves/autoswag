export type MappedReadonly = { readonly [K in keyof Base]: Base[K] }
type Base = { id: string; name: string }
