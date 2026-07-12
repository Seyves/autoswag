type IsArray<T> = T extends any[] ? true : false
export type Result = IsArray<string[]>
