import { Log, LogRequest } from "../../models/log";
import { RedisClientDb1 } from "./database-service";

/**
 * Handles CRUD operation related to the logs
 */

export default class LogService {
    
    /**
     * Creates a log storing login attempt information
     * @param email represent the user
     * @param authenticationStatus login attempt success
     * @param ip ip to store
     * @returns success status
     */

    public async logSigninMessageAsync(email: string, authenticationStatus: boolean, ip: string): Promise<LogRequest> {
        try {
            const timestamp = Date.now();

            const parsedIp = LogService.parseIPAddress(ip);

            const logEntry = {
                timestamp: timestamp.toString(),
                email: email,
                ip: parsedIp,
                success: authenticationStatus
            }

            const logEntrySerialized = JSON.stringify(logEntry);

            await RedisClientDb1.zAdd('login_logs', [
                {
                    score: timestamp,
                    value: logEntrySerialized,
                }
            ]);


            console.log(`Log added succesfully: ${logEntrySerialized}`)
            return { success: true, message: 'Log added succesfully', log: logEntry };
        } catch (error) {
            console.error('Error logging message: ', error);
            return { success: false, message: "Failed to log message" };
        }
    }

    /**
     * Retrieves all sign in logs
     * @returns array of logs
     */


    public async getAllSigninLogsAsync(): Promise<Log[]> {

        try {
            const data = await RedisClientDb1.zRange('login_logs', 0, -1);

            const deserializedData: Log[] = data.map(item => {
                const parsedItem = JSON.parse(item);
                return {
                    timestamp: parsedItem.timestamp,
                    email: parsedItem.email,
                    ip: parsedItem.ip,
                    success: parsedItem.success
                };
            });

            return deserializedData;
        } catch (error) {
            console.error('Error logging message: ', error);
            return [];
        }
    }


    /**
     * Retrieves partial logs
     * @param offset where to start
     * @param limit how many logs
     * @returns array of logs
     */

    public async getPartialSigninLogsAsync(offset: number, limit: number): Promise<Log[]> {

        limit += offset - 1;

        if (offset > limit) {
            return [];
        }

        console.log({message: `Fetching logs with offset: ${offset}, limit: ${limit}`});
        

        const data = await RedisClientDb1.zRange('login_logs', offset, limit);

        const deserializedData: Log[] = data.map(item => {
            const parsedItem = JSON.parse(item);
            return {
                timestamp: parsedItem.timestamp,
                email: parsedItem.email,
                ip: parsedItem.ip,
                success: parsedItem.success
            };
        });

        return deserializedData;
    }


    /**
     * Creates a log based on information send from the lock
     * @param timestamp time the log should be stored as
     * @param ip ip for the lock
     * @param status status of the lock
     * @returns 
     */

    public async logLockingMessageAsync(timestamp: string, ip: string, status: string): Promise<LogRequest> {
        try {
            const logEntry = {
                timestamp: timestamp,
                ip: ip,
                status: status
            }

            const logEntrySerialized = JSON.stringify(logEntry);

            await RedisClientDb1.zAdd('lock_logs', {
                score: timestamp,
                value: logEntrySerialized,
            });

            return { success: true, message: 'Log added succesfully' };
        } catch (error) {
            console.error('Error logging message: ', error);
            return { success: false, message: "Failed to log message" };
        }
    }


    /**
     * Retrieves all logs involving the locks
     * @returns array of logs
     */

    public async getAllLockingLogsAsync(): Promise<Log[]> {

        try {
            const data = await RedisClientDb1.zRange('lock_logs', 0, -1);

            const deserializedData: Log[] = data.map(item => {
                const parsedItem = JSON.parse(item);
                return {
                    timestamp: parsedItem.timestamp,
                    email: parsedItem.email,
                    ip: parsedItem.ip,
                    status: parsedItem.status
                };
            });

            return deserializedData;
        } catch (error) {
            console.error('Error logging message: ', error);
            return [];
        }
    }


    /**
     * Retrieves partial logs
     * @param offset where to start
     * @param limit how many logs
     * @returns array of logs
     */

    public async getPartialLockingLogsAsync(offset: number, limit: number): Promise<Log[]> {
        
        limit += offset - 1;

        if (offset > limit) {
            return [];
        }

        console.log({message: `Fetching logs with offset: ${offset}, limit: ${limit}`});

        const data = await RedisClientDb1.zRange('lock_logs', offset, limit);

        const deserializedData: Log[] = data.map(item => {
            const parsedData = JSON.parse(item);
            return {
                timestamp: parsedData.timestamp,
                ip: parsedData.ip,
                status: parsedData.status,
            };
        });

        return deserializedData;
    }

    
    /**
     * Parses the ip if it is in ipv6 format
     * @param ip 
     * @returns 
     */

    public static parseIPAddress(ip: string): string {

        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        return ip;
    }
}