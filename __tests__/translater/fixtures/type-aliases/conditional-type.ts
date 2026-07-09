export type Result = IsString<string>
export type IsString<T> = T extends string ? true : false
