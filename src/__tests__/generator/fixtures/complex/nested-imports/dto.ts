import { BaseModel } from './models'

/**
 * @component UserDTO
 */
export interface UserDTO extends BaseModel {
    username: string
    email: string
}

/**
 * @component ProductDTO
 */
export interface ProductDTO extends BaseModel {
    name: string
    price: number
}
