export type ConstrainedUser = Constrained<{ id: string; name: string }>
type Constrained<T extends { id: string }> = {
    item: T
}
