export type ResolvedObject = ObjectGeneric<{ age: string; name: number }>
type ObjectGeneric<T> = {
    nested?: T
}
