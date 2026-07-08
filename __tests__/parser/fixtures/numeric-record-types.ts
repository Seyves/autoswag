export type numberRecord = Record<number, number>
export type stringRecord = Record<number, string>
export type objectRecord = Record<number, { property: number }>
export interface mappedInterface {
    [key: number]: number
}
