/** @component List */
export type List = {
    value: string
}

export type TreeNode = {
    value: string
    children?: List[]
}
