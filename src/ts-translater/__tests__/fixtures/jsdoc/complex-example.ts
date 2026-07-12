export type Config = {
    /**
     * Application settings
     * @example { "theme": "dark", "lang": "en", "features": ["auth", "api"] }
     */
    settings: {
        theme: string
        lang: string
        features: string[]
    }
}
