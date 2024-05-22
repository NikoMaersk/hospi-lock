import { User } from "../models/User";
import { RedisClient } from "./database-service";

export default class AuthService {


    static async Authentication(email: string, password: string): Promise<{ success: boolean, message: string, statusCode: number }> {

        try {
            if (!email || !password) {
                return { success: false, message: 'Missing required fields', statusCode: 400 };
            }

            if (!AuthService.EmailValidator(email)) {
                return { success: false, message: 'Not a valid email', statusCode: 400 };
            }

            const tempUser: User = await RedisClient.hGetAll(`user:${email.toLowerCase()}`);
            const userExists: boolean = tempUser && Object.keys(tempUser).length > 0;

            if (!userExists) {
                return { success: false, message: 'No registered user with that email', statusCode: 400 };
            }

            if (password !== tempUser.password) {
                return { success: false, message: 'Invalid password', statusCode: 401 };
            }

            return { success: true, message: 'OK', statusCode: 200 };

        } catch (error) {
            console.error('Internal server error: ', error);
            return { success: false, message: 'Internal server error', statusCode: 500 };
        }
    }


    static async VerifyExistence(email: string): Promise<{success: boolean, message: string, statusCode: number}> {
        try {
            if (!email) {
                return { success: false, message: 'Missing required field', statusCode: 400 };
            }

            if (!AuthService.EmailValidator(email)) {
                return { success: false, message: 'Not a valid email', statusCode: 400 };
            }

            const tempUser: User = await RedisClient.hGetAll(email.toLowerCase());
            const userExists: boolean = tempUser && Object.keys(tempUser).length > 0;

            if (!userExists) {
                return { success: false, message: 'No registered user with that email', statusCode: 400 };
            }

            return { success: true, message: 'OK', statusCode: 200 };

        } catch (error) {
            console.error('Internal server error: ', error);
            return { success: false, message: 'Internal server error', statusCode: 500 };
        }
    }


    static EmailValidator(email: string) {
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }
}