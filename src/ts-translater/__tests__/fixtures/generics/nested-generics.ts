export type NestedBox = Box<Box<string>>
type Box<T> = { value: T }
