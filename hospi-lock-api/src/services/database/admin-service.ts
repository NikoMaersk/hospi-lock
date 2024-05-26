import { RedisClientDb1 } from "../database-service";
import Admin, { AdminRequest } from "../../models/admin";
import AuthService, { Role } from "../auth-service";

export default class AdminService {

    static async addAdminAsync(admin: Admin): Promise<AdminRequest> {
        const lowerCaseEmail = admin.email.toLowerCase();
        const request: AdminRequest = await AuthService.CheckAdminExistenceAsync(lowerCaseEmail);

        if (request.success) {
            return { success: false, message: 'Admin already registered', statusCode: 409 };
        }

        await RedisClientDb1.hSet(`admin:${admin.email}`, {
            email: lowerCaseEmail,
            password: admin.password
        });

        return { success: true, message: 'Admin created', statusCode: 201 }
    }


    static async getAdminByEmailAsync(email: string): Promise<AdminRequest> {
        const lowerCaseEmail: string = email.toLowerCase();

        const request: AdminRequest = await AuthService.CheckExistenceAsync(lowerCaseEmail, Role.ADMIN);

        return request;
    }


    static async getAllAdmins(): Promise<Record<string, Admin>> {
        const keys = await RedisClientDb1.keys('admin:*');
        const allHashes: Record<string, Admin> = {};

        const promises = keys.map(async (key) => {
            const admin: Admin = await RedisClientDb1.hGetAll(key);
            allHashes[key] = admin;
        });

        await Promise.all(promises);

        return allHashes;
    }
}