export interface User {
    id: string
    name: string
    age: number
    preferences: Preferences
}

export interface Preferences {
    fontSize: number
    theme: string
}
