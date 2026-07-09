export type User = HasId & HasName
type HasId = { id: string }
type HasName = { name: string }
