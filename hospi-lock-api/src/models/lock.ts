
export interface Lock {
    id?: number,
    ip: string,
    status: number,
    email?: string
}

export interface LockRequest {
    success: boolean,
    message: string,
    statusCode: number,
    lock?: Lock
}