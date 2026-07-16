export type DefaultUsed = WithDefault
type WithDefault<T = string> = {
    value: T
}
