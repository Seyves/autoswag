export type User = {
    id: string
    preferences: {
        /**
         * Font size in pixels
         * @example 14
         * @minimum 8
         * @maximum 32
         */
        fontSize: number
    }
}
