import { z } from 'zod/v3'

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
    id: z.string().uuid(),
    /** @format email */
    email: z.string().email(),
    address: AddressSchema,
    billing: z.object({
        cardNumber: z.string(),
        cvv: z.string(),
    }),
})

export type User = z.infer<typeof UserSchema>
