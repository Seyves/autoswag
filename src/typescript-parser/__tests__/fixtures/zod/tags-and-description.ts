import { z } from 'zod'

export const UserSchema = z.object({
    /** 
     * User ID
     * @format uuid 
     */
    id: z.uuid(),
    /** User name */
    name: z.string(),
    age: z.number(),
    isActive: z.boolean(),
})

export type User = z.infer<typeof UserSchema>
