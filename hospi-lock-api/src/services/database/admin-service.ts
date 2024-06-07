import { RedisClientDb1 } from "./database-service";
import { Admin, AdminRequest } from "../../models/admin";
import { IRoleService } from "../roleService";

export default class AdminService implements IRoleService<Admin> {

    public async addAdminAsync(admin: Admin): Promise<AdminRequest> {
        const lowerCaseEmail = admin.email.toLowerCase();
        const request = await this.checkExistenceAsync(lowerCaseEmail);

        if (request.success) {
            return { success: false, message: 'Admin already registered', statusCode: 409 };
        }

        await RedisClientDb1.hSet(`admin:${admin.email}`, {
            email: lowerCaseEmail,
            password: admin.password
        });

        return { success: true, message: 'Admin created', statusCode: 201 }
    }


    public async getAdminByEmailAsync(email: string): Promise<AdminRequest> {
        const lowerCaseEmail: string = email.toLowerCase();

        const request = await this.checkExistenceAsync(lowerCaseEmail);

        return request;
    }


    public async getAllAdmins(): Promise<Record<string, Admin>> {
        const keys = await RedisClientDb1.keys('admin:*');
        const allHashes: Record<string, Admin> = {};

        const promises = keys.map(async (key) => {
            const admin: Admin = await RedisClientDb1.hGetAll(key);
            allHashes[key] = admin;
        });

        await Promise.all(promises);

        return allHashes;
    }


    public async checkExistenceAsync(email: string): Promise<{ success: boolean, role?: Admin; }> {
        const tempAdmin: Admin = await RedisClientDb1.hGetAll(`admin:${email}`);

        const adminExists: boolean = tempAdmin && Object.keys(tempAdmin).length > 0;

        if (!adminExists) {
            return { success: false };
        }

        const admin: Admin = {
            email: tempAdmin.email,
            password: tempAdmin.password,
        }

        return { success: true, role: admin };
    }
}