
export default interface Admin {
    email: string,
    password: string,
}


export interface AdminRequest {
    success: boolean,
    message: string,
    statusCode?: number,
    user?: Admin
}