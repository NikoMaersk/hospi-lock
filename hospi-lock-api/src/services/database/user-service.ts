import { RedisClient } from "../database-service";
import { User } from "../../models/User";

export interface UserRequest {
    success: boolean,
    message: string,
    statusCode: number,
    user?: User
}

export default class UserService {
    static async getUserByEmailAsync(email: string): Promise<UserRequest> {
        const lowerCaseEmail = email.toLowerCase();
        const tempUser = await RedisClient.hGetAll(`user:${lowerCaseEmail}`);

        if (Object.keys(tempUser).length === 0) {
            return { success: false, message: 'No registered user with that email', statusCode: 400 }
        }

        const user: User = {
            email: lowerCaseEmail,
            password: tempUser.password,
            firstName: tempUser.first_name,
            lastName: tempUser.last_name,
            date: tempUser.reg_date,
            lockId: tempUser.lock_id || ""
        }

        return { success: true, message: "User fetched", statusCode: 200, user: user };
    }

    static async getAllUsersAsync(): Promise<Record<string, User>> {
        try {
            const keys = await RedisClient.keys("user:*");
            const allHashes: Record<string, User> = {};

            const promises = keys.map(async (key) => {
                const hashValues = await RedisClient.hGetAll(key);

                const tempUser: User = {
                    email: hashValues.email,
                    password: hashValues.password,
                    firstName: hashValues.first_name,
                    lastName: hashValues.last_name,
                    date: hashValues.reg_date,
                    lockId: hashValues.lock_id
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

    static async addUserAsync(user: User): Promise<UserRequest> {
        const lowerCaseEmail = user.email.toLowerCase();
        const tempUser = await RedisClient.hGetAll(`user:${lowerCaseEmail}`);

        const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;

        if (userAlreadyExists) {
            return { success: false, message: 'User already exists', statusCode: 409 }; // Changed status code to 409 Conflict
        }

        let now = new Date();

        await RedisClient.hSet(`user:${lowerCaseEmail}`, {
            email: lowerCaseEmail,
            password: user.password,
            first_name: user.firstName,
            last_name: user.lastName,
            reg_date: now.toISOString(),
            lock_id: user.lockId || "",
        });

        return { success: true, message: 'User created', statusCode: 201 };
    }
}