export type UserWithoutEmail = Omit<User, 'email'>
type User = { id: string; name: string; age: number; email: string }
