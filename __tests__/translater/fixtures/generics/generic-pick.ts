export type UserPreview = Pick<User, 'id' | 'name'>
type User = { id: string; name: string; age: number; email: string }
