import { z } from 'zod'

export const AddressSchema = z.object({
    /** Street address */
    street: z.string(),
    city: z.string(),
    zip: z.string(),
})

export const UserSchema = z.object({
    /** 
     * User ID 
     * @format uuid
     */
    id: z.uuid(),
    /** @format email */
    email: z.email(),
    address: AddressSchema,
    billing: z.object({
        cardNumber: z.string(),
        cvv: z.string(),
    }),
})

export type User = z.infer<typeof UserSchema>
