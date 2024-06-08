import { RedisClientDb0 } from "./database-service";
import { User, UserRequest } from "../../models/user";
import { IRoleService } from "../interfaces/role-service";

export default class UserService implements IRoleService<User> {
    
    public async getUserByEmailAsync(email: string): Promise<UserRequest> {
        const lowerCaseEmail = email.toLowerCase();
        const tempUser = await RedisClientDb0.hGetAll(`user:${lowerCaseEmail}`);

        if (Object.keys(tempUser).length === 0) {
            return { success: false, message: 'No registered user with that email', statusCode: 400 }
        }

        const user: User = {
            email: lowerCaseEmail,
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            date: tempUser.regDate,
            lockId: tempUser.lockId || ""
        }

        return { success: true, message: "User fetched", statusCode: 200, user: user };
    }

    
    public async getAllUsersAsync(): Promise<Record<string, User>> {
        try {
            const keys = await RedisClientDb0.keys("user:*");
            const allHashes: Record<string, User> = {};

            const promises = keys.map(async (key) => {
                const hashValues = await RedisClientDb0.hGetAll(key);

                const tempUser: User = {
                    email: hashValues.email,
                    firstName: hashValues.firstName,
                    lastName: hashValues.lastName,
                    date: hashValues.regDate,
                    lockId: hashValues.lockId
                };

                allHashes[key] = tempUser;
            });

            await Promise.all(promises);

            return allHashes;
        } catch (error) {
            console.error('Error fetching all users: ', error);
            throw new Error('Failed to fetch all users');
        }
    }


    public async getPartialUsersAsync(amount: number): Promise<Record<string, User>> {
        const cursor = 0;
        const pattern = 'user:*';
        const countAmount = amount;

        const keys = await RedisClientDb0.scan(cursor, 'MATCH', pattern, 'COUNT', countAmount);
        const allHashes: Record<string, User> = {};

        const promises = keys.map(async (key) => {
            const hashValues = await RedisClientDb0.hGetAll(key);

            const tempUser: User = {
                email: hashValues.email,
                firstName: hashValues.firstName,
                lastName: hashValues.lastName,
                date: hashValues.date,
                lockId: hashValues.lockId
            }

            allHashes[key] = tempUser;
        });

        await Promise.all(promises);

        return allHashes;
    }


    public async addUserAsync(user: User): Promise<UserRequest> {
        const lowerCaseEmail = user.email.toLowerCase();
        const tempUser = await RedisClientDb0.hGetAll(`user:${lowerCaseEmail}`);

        const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;

        if (userAlreadyExists) {
            return { success: false, message: 'User already exists', statusCode: 409 };
        }

        let now = new Date();

        await RedisClientDb0.hSet(`user:${lowerCaseEmail}`, {
            email: lowerCaseEmail,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            regDate: now.toISOString(),
            lockId: user.lockId || "",
        });

        return { success: true, message: 'User created', statusCode: 201 };
    }


    public async patchPasswordAsync(email: string, newPassword: string): Promise<UserRequest> {

        const getUserRequest: UserRequest = await this.getUserByEmailAsync(email);

        if (!getUserRequest.success) {
            return getUserRequest;
        }

        const tempUser = getUserRequest.user;

        await RedisClientDb0.hSet(`user:${tempUser.email}`, 'password', newPassword);

        return getUserRequest;
    }


    public async checkExistenceAsync(email: string): Promise<{ success: boolean, role?: User; }> {

        const tempUser = await RedisClientDb0.hGetAll(`user:${email.toLowerCase()}`);
        const userExists: boolean = tempUser && Object.keys(tempUser).length > 0;

        if (!userExists) {
            return { success: false };
        }

        const user: User = {
            email: tempUser.email,
            password: tempUser.password,
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            date: tempUser.regDate,
            lockId: tempUser.lockId
        }

        return { success: true, role: user };
    }
}