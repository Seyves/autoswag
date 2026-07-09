type ElementType<T> = T extends (infer U)[] ? U : never
export type StringElement = ElementType<string[]>
