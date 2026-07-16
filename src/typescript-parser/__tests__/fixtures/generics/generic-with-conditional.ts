export type Result = IsArray<string[]>
type IsArray<T> = T extends any[] ? true : false
