export type User = HasId & HasName & HasAge
type HasId = { id: string }
type HasName = { name: string }
type HasAge = { age: number }
