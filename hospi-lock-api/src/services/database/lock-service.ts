import { RedisClientDb0 } from "./database-service";
import { Lock, LockRequest } from "../../models/lock";
import UserService from "./user-service";

/**
 * Handles CRUD operation related to the Lock
 */

export default class LockService {

    private userService: UserService;

    /**
     * Creates a LockService
     * @param userService an instance of the UserService as DI
     */
    public constructor(userService: UserService) {
        this.userService = userService;
    }


    /**
     * Creates a new lock in the database
     * @param lock the lock to be added
     * @returns wether or not it succeeds
     */

    public async addLockAsync(lock: Lock): Promise<LockRequest> {
        try {

            if (lock.email) {
                lock.email = lock.email.toLowerCase();

                

                const authResult = await this.userService.checkExistenceAsync(lock.email);

                if (!authResult.success) {
                    return {
                        success: authResult.success,
                        message: 'No registered user with that email',
                        statusCode: 400
                    };
                }
            }

            const newId = await RedisClientDb0.incr('lock_id_counter');
            lock.id = newId.toString();
            lock.status = 0;

            await RedisClientDb0.hSet(`lock:${lock.id}`, lock);

            return { success: true, message: 'Lock registered', statusCode: 201, lock: lock };
        } catch (error) {
            return { success: false, message: 'Internal server error', statusCode: 500 }
        }
    }


    /**
     * Retrieves all locks from the database
     * @returns dictionary storing the retrieved locks
     */

    public async getAllLocksAsync(): Promise<Record<string, Lock>> {
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


    /**
     * Retrieves a Lock by the Id
     * @param id id to retrieve the lock by
     * @returns true if it succeeds including the lock
     */

    public async getLockByIdAsync(id: string): Promise<LockRequest> {
        const lock = await RedisClientDb0.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock with that id', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }


    /**
     * Retrieves a specific Lock by email
     * @param email email to retrieve lock by
     * @returns true if it succeeds including the lock
     */

    public async getLockByEmail(email: string): Promise<LockRequest> {
        const lowerCaseEmail = email.toLowerCase();
        const authResult = await this.userService.checkExistenceAsync(lowerCaseEmail);

        if (!authResult.success) {
            return {
                success: false,
                message: 'No registered user with that email',
                statusCode: 400
            };
        }

        const user = authResult.role;

        const lock = await RedisClientDb0.hGetAll(`lock:${user.lockId}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No lock registeret with that email', statusCode: 400 };
        }

        return { success: true, message: 'Lock fetched', statusCode: 200, lock: lock };
    }

    /**
     * Retrieves the status of a specific lock
     * @param id key to the lock
     * @returns true if it finds the lock including the status
     */

    public async getLockStatusAsync(id: string): Promise<{ success: boolean, message: string, statusCode: number, lockStatus?: boolean }> {
        const lockRequest: LockRequest = await this.getLockByIdAsync(id);

        if (!lockRequest.success) {
            return { success: lockRequest.success, message: lockRequest.message, statusCode: lockRequest.statusCode }
        }

        const statusAsBool = !!lockRequest.lock.status

        return { success: true, message: lockRequest.message, statusCode: lockRequest.statusCode, lockStatus: statusAsBool }
    }


    /**
     * Retrieves the IP of a specific lock
     * @param email to retrieve the lock by
     * @returns the IP
     */

    public async getLockIPAsync(email: string): Promise<string> {
        const lockRequest: LockRequest = await this.getLockByEmail(email);
        let ip: string = "";

        if (!lockRequest.success) {
            ip = lockRequest.lock.ip;
        }

        return ip;
    }


    /**
     * Adds the lock id to the user
     * @param email representing the user
     * @param id representing the lock
     * @returns success status
     */

    public async addLockForUserAsync(email: string, id: string): Promise<LockRequest> {
        const authResult = await this.userService.checkExistenceAsync(email);

        if (!authResult.success) {
            return {
                success: false,
                message: 'No registered user with that email',
                statusCode: 400
            }
        }

        const lock: Lock = await RedisClientDb0.hGetAll(`lock:${id}`);

        if (Object.keys(lock).length === 0) {
            return { success: false, message: 'No registered lock with that id', statusCode: 400 };
        }

        if (lock.email && lock.email.trim() !== "") {
            return { success: false, message: 'User already registered for that lock', statusCode: 409 }
        }

        if (authResult.role.email && authResult.role.email.trim() === "") {
            return { success: false, message: 'User already have a registered lock', statusCode: 409 };
        }

        await RedisClientDb0.hSet(`lock:${id}`, {
            email: email,
        });

        await RedisClientDb0.hSet(`user:${email}`, {
            lockId: id,
        });

        return { success: true, message: 'User registeret for the specified lock', statusCode: 201 };
    }


    /**
     * Changes the status of a lock
     * @param lock the lock to be modified
     * @param status current status
     * @returns success status
     */

    public async setStatusAsync(lock: Lock, status: boolean): Promise<{ success: boolean, message: string, statusCode: number }> {
        try {
            const newStatus = status ? 0 : 1;

            lock.status = newStatus;

            await RedisClientDb0.hSet(`lock:${lock.id}`, lock);

            return { success: true, message: 'Lock registered', statusCode: 201 };
        } catch (error) {
            return { success: false, message: 'Internal server error', statusCode: 500 }
        }
    }
}