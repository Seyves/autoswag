export interface User {
    id: string
    name: string
    age: number
    preferences: {
        fontSize: number
        theme: string
    }
}
