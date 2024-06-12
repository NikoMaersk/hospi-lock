import { RedisClientDb0 } from "./database-service";
import { User, UserRequest } from "../../models/user";
import { IRoleService } from "../interfaces/role-service";
import { capitalizeFirstLetter } from "../../util/string-util";
const bcrypt = require('bcryptjs');

/**
 * Handles CRUD operation relevant for the User
 */
export default class UserService implements IRoleService<User> {
    
    /**
     * Retrieves a user by email
     * @param email email to retrieve user by
     * @returns success status including the User object
     */

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

    
    /**
     * Retrieves all stored users
     * @returns dictionary with users
     */

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


    /**
     * Retrieves partial user
     * @param amount number of users to retrieve
     * @returns dictionary with users
     */

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


    /**
     * Creates a user in the database
     * @param user to be created
     * @returns success status
     */

    public async addUserAsync(user: User): Promise<UserRequest> {
        const lowerCaseEmail = user.email.toLowerCase();
        const tempUser = await RedisClientDb0.hGetAll(`user:${lowerCaseEmail}`);

        const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;

        if (userAlreadyExists) {
            return { success: false, message: 'User already exists', statusCode: 409 };
        }

        let now = new Date();      
        const salt: string = await bcrypt.genSalt();
        const hashedPassword: string = await bcrypt.hash(user.password, salt);

        const capitalizeFirstName: string = capitalizeFirstLetter(user.firstName);
        const capitalizedLastName: string = capitalizeFirstLetter(user.lastName);

        await RedisClientDb0.hSet(`user:${lowerCaseEmail}`, {
            email: lowerCaseEmail,
            password: hashedPassword,
            firstName: capitalizeFirstName,
            lastName: capitalizedLastName,
            regDate: now.toISOString(),
            lockId: user.lockId || "",
        });

        return { success: true, message: 'User created', statusCode: 201 };
    }


    /**
     * Updates the password for a user
     * @param email key to the user
     * @param newPassword
     * @returns success status
     */

    public async patchPasswordAsync(email: string, newPassword: string): Promise<UserRequest> {

        const getUserRequest: UserRequest = await this.getUserByEmailAsync(email);

        if (!getUserRequest.success) {
            return getUserRequest;
        }

        const tempUser = getUserRequest.user;

        const newSalt: string = await bcrypt.genSalt();
        const newHashedPassword: string = await bcrypt.hash(newPassword, newSalt);

        await RedisClientDb0.hSet(`user:${tempUser.email}`, {
            hashedPassword: newHashedPassword,
            salt: newSalt,
        });

        return getUserRequest;
    }


    /**
     * Implementation of the IRoleService interface. Check if a user is registered
     * @param email key to the user
     * @returns success status including the user if success
     */

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