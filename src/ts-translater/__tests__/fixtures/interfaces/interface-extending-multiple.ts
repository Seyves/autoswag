export interface User extends HasId, HasName {
    age: number
}

interface HasId {
    id: string
}

interface HasName {
    name: string
}

