
export interface Log {
    timestamp: string,
    email?: string,
    ip: string,
    success: boolean,
}


export interface LogRequest {
    success: boolean,
    message?: string,
    log?: Log
}