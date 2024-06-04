import { RedisClientDb0 } from "./database-service";
import Lock from "../../models/lock";
import AuthService from "../auth-service";

export interface LockRequest {
    success: boolean,
    message: string,
    statusCode: number,
    lock?: Lock
}

export default class LockService {

    static async addLockAsync(lock: Lock): Promise<LockRequest> {

        if (lock.email) {
            lock.email = lock.email.toLowerCase();
            const authResult = await AuthService.CheckUserExistenceAsync(lock.email);

            if (!authResult.success) {
                return {
                    success: authResult.success,
                    message: authResult.message,
                    statusCode: authResult.statusCode
                };
            }
        }

        try {
            const newId = await RedisClientDb0.incr('lock_id_counter');
            lock.id = newId.toString();
            lock.status = 0;

            await RedisClientDb0.hSet(`lock:${lock.id}`, lock);

            return { success: true, message: 'Lock registered', statusCode: 201, lock: lock };
        } catch (error) {
            return { success: false, message: 'Internal server error', statusCode: 500 }
        }
    }


    static async getAllLocksAsync(): Promise<Record<string, Lock>> {
        try {
            const keys = await RedisClientDb0.keys('lock:*')
            const allHashes: Record<string, Lock> = {};

            const promises = keys.map(async (key) => {
                const hashValues = await RedisClientDb0.hGetAll(key);

                const tempLock: Lock = {
                    id: hashValues.id,
                    ip: hashValues.ip,
                    status: hashValues.status,
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


    static async getLockByIdAsync(id: string): Promise<LockRequest> {
        const lock = await RedisClientDb0.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock with that id', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }


    static async getLockByEmail(email: string): Promise<LockRequest> {
        const lowerCaseEmail = email.toLowerCase();
        const authResult = await AuthService.CheckUserExistenceAsync(lowerCaseEmail);

        if (!authResult.success) {
            return {
                success: false,
                message: authResult.message,
                statusCode: authResult.statusCode
            };
        }

        const user = authResult.user;

        const lock = await RedisClientDb0.hGetAll(`lock:${user.lockId}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock registeret with that email', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }


    static async getLockStatusAsync(id: string): Promise<{ success: boolean, message: string, statusCode: number, lockStatus?: boolean }> {
        const lockRequest: LockRequest = await this.getLockByIdAsync(id);

        if (!lockRequest.success) {
            return { success: lockRequest.success, message: lockRequest.message, statusCode: lockRequest.statusCode }
        }

        const statusAsBool = !!lockRequest.lock.status

        return { success: true, message: lockRequest.message, statusCode: lockRequest.statusCode, lockStatus: statusAsBool }
    }


    static async getLockIPAsync(email: string): Promise<string> {
        const lockRequest: LockRequest = await this.getLockByEmail(email);
        let ip: string = "";

        if (!lockRequest.success) {
            ip = lockRequest.lock.ip;
        }

        return ip;
    }


    static async addLockForUserAsync(email: string, id: string): Promise<LockRequest> {
        const authResult = await AuthService.CheckUserExistenceAsync(email);

        if (!authResult.success) {
            return {
                success: false,
                message: authResult.message,
                statusCode: authResult.statusCode
            }
        }

        const lock: Lock = await RedisClientDb0.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No registered lock with that id', statusCode: 400 };
        }

        if (lock.email && lock.email.trim() !== "") {
            return { success: false, message: 'User already registered for that lock', statusCode: 409 }
        }

        if (authResult.user.email && authResult.user.email.trim() === "") {
            return { success: false, message: 'User already have a registered lock', statusCode: 409 };
        }

        await RedisClientDb0.hSet(`lock:${id}`, {
            email: email,
        });

        await RedisClientDb0.hSet(`user:${email}`, {
            lock_id: id,
        });

        return { success: true, message: 'User registeret for the specified lock', statusCode: 201 };
    }


    static async setStatusAsync(lock: Lock, status: boolean): Promise<{ success: boolean, message: string, statusCode: number }> {
        try {

            const newStatus = status ? 1 : 0;

            lock.status = newStatus;

            await RedisClientDb0.hSet(`lock:${lock.id}`, lock);

            return { success: true, message: 'Lock registered', statusCode: 201 };
        } catch (error) {
            return { success: false, message: 'Internal server error', statusCode: 500 }
        }
    }
}