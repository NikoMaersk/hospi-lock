import { User } from "../models/User";
import { RedisClient } from "./database-service";

export default class AuthService {


    static async Authentication(email: string, password: string): Promise<{ success: boolean, message: string, statusCode: number, user?: any }> {

        try {

            const verifyUser = await AuthService.CheckUserExistence(email);

            if (!verifyUser.success) {
                return { success: verifyUser.success, message: verifyUser.message, statusCode: verifyUser.statusCode};
            }

            const tempUser = verifyUser.user;

            if (password !== tempUser.password) {
                return { success: false, message: 'Invalid password', statusCode: 401 };
            }

            return { success: true, message: 'OK', statusCode: 200, user: tempUser };

        } catch (error) {
            console.error('Internal server error: ', error);
            return { success: false, message: 'Internal server error', statusCode: 500 };
        }
    }


    static async CheckUserExistence(email: string): Promise<{success: boolean, message: string, statusCode: number, user?: any}> {
        try {
            if (!email) {
                return { success: false, message: 'Missing required field', statusCode: 400 };
            }

            if (!AuthService.EmailValidator(email)) {
                return { success: false, message: 'Not a valid email', statusCode: 400 };
            }

            const tempUser: User = await RedisClient.hGetAll(`user:${email.toLowerCase()}`);
            const userExists: boolean = tempUser && Object.keys(tempUser).length > 0;

            if (!userExists) {
                return { success: false, message: 'No registered user with that email', statusCode: 400 };
            }

            return { success: true, message: 'OK', statusCode: 200, user: tempUser };

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