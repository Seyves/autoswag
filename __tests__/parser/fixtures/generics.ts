export type ResolvedArray = ArrayGeneric<number>
export type ResolvedObject = ObjectGeneric<{ age: string; name: number }>

type ArrayGeneric<T> = T[]
type ObjectGeneric<T> = {
    nested?: T
}
