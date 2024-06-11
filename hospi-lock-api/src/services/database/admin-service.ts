import { RedisClientDb1 } from "./database-service";
import { Admin, AdminRequest } from "../../models/admin";
import { IRoleService } from "../interfaces/role-service";

/**
 * Handles CRUD operations related to the Admin object
 */


export default class AdminService implements IRoleService<Admin> {

    /**
     * Creates a new Admin in the database
     * @param admin the admin object to be added
     * @returns wether or not the create operation succeeds
     */

    public async addAdminAsync(admin: Admin): Promise<AdminRequest> {
        const lowerCaseEmail = admin.email.toLowerCase();
        const request = await this.checkExistenceAsync(lowerCaseEmail);

        if (request.success) {
            return { success: false, message: 'Admin already registered', statusCode: 409 };
        }

        console.log(`email: ${admin.email}, password: ${admin.password}, url: ${admin.iconUrl}`)

        await RedisClientDb1.hSet(`admin:${admin.email}`, {
            email: lowerCaseEmail,
            password: admin.password,
            iconUrl: admin.iconUrl || "",
        });

        return { success: true, message: 'Admin created', statusCode: 201 }
    }


    /**
     * Attempts to retrieve a specific admin from the database
     * @param email represents the key to the admin
     * @returns success status including the object if it succeeds
     */

    public async getAdminByEmailAsync(email: string): Promise<AdminRequest> {

        const request = await this.checkExistenceAsync(email);

        if (!request.success) {
            return { success: request.success, message: 'No registered admin with that email', statusCode: 400 }
        }

        return {success: request.success, message: 'Admin fetched', statusCode: 200, admin: request.role};
    }


    /**
     * Retrieves all admin from the database
     * @returns a dictionary containing the admins
     */

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


    /**
     * Implementation of the IRoleService interface. Checks wether or not a admin is stored in the database
     * @param email represents the key to the admin
     * @returns success status including the admin if it succeeds
     */

    public async checkExistenceAsync(email: string): Promise<{ success: boolean, role?: Admin; }> {
        const tempAdmin = await RedisClientDb1.hGetAll(`admin:${email.toLowerCase()}`);

        const adminExists: boolean = tempAdmin && Object.keys(tempAdmin).length > 0;

        if (!adminExists) {
            return { success: false };
        }

        const admin: Admin = {
            email: tempAdmin.email,
            password: tempAdmin.password,
            iconUrl: tempAdmin.iconUrl
        }

        return { success: true, role: admin };
    }
}