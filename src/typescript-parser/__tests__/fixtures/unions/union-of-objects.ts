export type UserOrAdmin = { type: 'user'; name: string } | { type: 'admin'; permissions: string[] }
