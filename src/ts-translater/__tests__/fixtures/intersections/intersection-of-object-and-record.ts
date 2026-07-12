export type User = HasId & RecordType
type HasId = { id: string }
type RecordType = Record<string, string>
