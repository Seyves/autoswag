/** @component List */
export type List = {
    value: string
    next?: TreeNode
}

export type TreeNode = {
    value: string
    children?: List[]
}
