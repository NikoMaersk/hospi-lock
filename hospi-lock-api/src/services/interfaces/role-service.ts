import { BaseRole } from "../../models/baseRole";

export interface IRoleService<T extends BaseRole> {
    checkExistenceAsync(email: string): Promise<{ success: boolean, role?: T }>;
}