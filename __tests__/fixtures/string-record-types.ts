export type numberRecord = Record<string, number>
export type stringRecord = Record<string, string>
export type objectRecord = Record<string, { property: number }>
export interface mappedInterface {
    [key: string]: number
}
