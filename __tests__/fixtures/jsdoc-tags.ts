//TODO 

/** @description User object */
export interface User {
    /** @example 5516e359-6c9c-4ebb-a409-52373d536d50 */
    id: string

    /** @example Alex */
    name: string

    /**
     * @description Age of a user
     * @example 32
     */
    age: number

    emailVerified?: boolean
}
