export type NestedRecord = Record<
    string,
    {
        id: string
        data: {
            value: number
            items: string[]
        }
    }
>
