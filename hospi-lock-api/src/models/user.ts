import { BaseRole } from "./baseRole"

export interface User extends BaseRole {
    firstName: string,
    lastName: string,
    date?: string,
    lockId?: number
}


export interface UserRequest {
    success: boolean,
    message: string,
    statusCode: number,
    user?: User
}