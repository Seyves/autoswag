export type User = {
    /**
     * User ID
     * @example "5516e359-6c9c-4ebb-a409-52373d536d50"
     * @format uuid
     */
    id: string
    /**
     * User's age
     * @example 30
     * @minimum 0
     * @maximum 150
     */
    age: number
}
