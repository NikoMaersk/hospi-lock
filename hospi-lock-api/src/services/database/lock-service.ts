import { RedisClient } from "../database-service";
import Lock from "../../models/lock";
import AuthService from "../auth-service";

export interface LockRequest {
    success: boolean,
    message: string,
    statusCode: number,
    lock?: Lock
}

export default class LockService {

    static async addLock(lock: Lock): Promise<LockRequest> {

        if (lock.email) {
            lock.email = lock.email.toLowerCase();
            const authResult = await AuthService.CheckUserExistence(lock.email);

            if (!authResult.success) {
                return {
                    success: authResult.success,
                    message: authResult.message,
                    statusCode: authResult.statusCode
                };
            }
        }

        const newId = await RedisClient.incr('lock_id_counter');
        lock.id = newId.toString();

        await RedisClient.hSet(`lock:${lock.id}`, lock);

        return { success: true, message: "Lock registered", statusCode: 201, lock: lock };
    }


    static async getAllLocks(): Promise<Record<string, Lock>> {
        try {
            const keys = await RedisClient.keys('lock:*')
            const allHashes: Record<string, Lock> = {};

            const promises = keys.map(async (key) => {
                const hashValues = await RedisClient.hGetAll(key);

                const tempLock: Lock = {
                    id: hashValues.id,
                    ip: hashValues.ip,
                    email: hashValues.email
                };

                allHashes[key] = tempLock;
            });

            await Promise.all(promises);

            return allHashes;
        } catch (error) {
            console.error('Error fetching all users: ', error);
            throw new Error('Failed to fetch all users');
        }
    }


    static async getLockById(id: string): Promise<LockRequest> {
        const lock = await RedisClient.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock with that id', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }


    static async getLockByEmail(email: string): Promise<LockRequest> {
        const lowerCaseEmail = email.toLowerCase();
        const authResult = await AuthService.CheckUserExistence(lowerCaseEmail);

        if (!authResult.success) {
            return {
                success: false,
                message: authResult.message,
                statusCode: authResult.statusCode
            };
        }

        const user = authResult.user;

        const lock = await RedisClient.hGetAll(`lock:${user.lockId}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock registeret with that email', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }


    static async getLockIP(email: string): Promise<string> {
        const lockRequest: LockRequest = await this.getLockByEmail(email);
        let ip: string = "";

        if (lockRequest.success) {
            ip = lockRequest.lock.ip;
        }

        return ip;
    }


    static async addLockForUser(email: string, id: string): Promise<LockRequest> {
        const authResult = await AuthService.CheckUserExistence(email);

        if (!authResult.success) {
            return {
                success: false,
                message: authResult.message,
                statusCode: authResult.statusCode
            }
        }

        const lock: Lock = await RedisClient.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No registered lock with that id', statusCode: 400 };
        }

        if (lock.email && lock.email.trim() !== "") {
            return { success: false, message: 'User already registered for that lock', statusCode: 409 }
        }

        if (authResult.user.email && authResult.user.email.trim() === "") {
            return { success: false, message: 'User already have a registered lock', statusCode: 409 };
        }

        await RedisClient.hSet(`lock:${id}`, {
            email: email,
        });

        await RedisClient.hSet(`user:${email}`, {
            lock_id: id,
        });

        return { success: true, message: 'User registeret for the specified lock', statusCode: 201 };
    }
}