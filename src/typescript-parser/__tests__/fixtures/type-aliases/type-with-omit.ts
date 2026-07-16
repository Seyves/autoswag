export type UserWithoutAge = Omit<User, 'age'>
type User = { id: string; name: string; age: number }
