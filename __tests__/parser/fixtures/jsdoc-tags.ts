/** User object */
export interface User {
    /**
     * User ID
     * @example "5516e359-6c9c-4ebb-a409-52373d536d50"
     * @format uuid
     */
    id: string

    /** 
     * User's name
     * @example "Alex" 
     */
    name: string

    /**
     * User's age
     * @example 32
     * @minimum 0
     * @maximum 200
     */
    age: number

    preferences: Preferences
}

/**
 * Preferences object
 * @example
 * { "fontSize": 14, "theme": "light" }
 */
export interface Preferences {
    fontSize: number

    theme: string
}
