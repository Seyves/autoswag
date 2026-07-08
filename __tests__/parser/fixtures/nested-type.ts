export type User = {
    id: string
    name: string
    age: number
    preferences: Preferences
}

export type Preferences = {
    fontSize: number
    theme: string
}
