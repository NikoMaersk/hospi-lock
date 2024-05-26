
export interface User {
    email : string,
    password : string,
    firstName : string,
    lastName : string,
    date?: string,
    lockId?: number
}


export interface UserRequest {
    success: boolean,
    message: string,
    statusCode: number,
    user?: User
}