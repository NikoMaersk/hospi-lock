import { BaseRole } from "./baseRole";

export interface Admin extends BaseRole {
    iconUrl?: string,
}


export interface AdminRequest {
    success: boolean,
    message?: string,
    statusCode?: number,
    admin?: Admin
}