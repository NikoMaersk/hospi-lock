import { Log } from "../../models/log";
import { RedisClient } from "../database-service";

export interface LogRequest {
    success: boolean,
    message?: string,
    log?: Log
}

export default class LogService {
    static async logMessage(email: string, authenticationStatus: boolean, ip: string): Promise<LogRequest> {
        try {
            const timestamp = Date.now();
            await RedisClient.sendCommand(['SELECT', '1']);

            const parsedIp = this.parseIPAddress(ip);

            const logEntry = {
                timestamp: timestamp.toString(),
                email: email,
                ip: parsedIp,
                success: authenticationStatus
            }

            const logEntrySerialized = JSON.stringify(logEntry);

            await RedisClient.zAdd('logs', [
                {
                    score: timestamp,
                    value: logEntrySerialized,
                }
            ]);

            await RedisClient.sendCommand(['SELECT', '0']);
            return { success: true, message: 'Log added succesfully' };
        } catch (error) {
            console.error('Error logging message: ', error);
            return { success: false, message: "Failed to log message" };
        }
    }


    static async getAllLogs(): Promise<Log[]> {

        try {
            await RedisClient.sendCommand(['SELECT', '1']);
            const data = await RedisClient.zRange('logs', 0, -1);

            const deserializedData: Log[] = data.map(item => {
                const parsedItem = JSON.parse(item);
                return {
                    timestamp: parsedItem.timestamp,
                    email: parsedItem.email,
                    ip: parsedItem.ip,
                    success: parsedItem.success
                };
            });

            await RedisClient.sendCommand(['SELECT', '0']);

            return deserializedData;
        } catch (error) {
            console.error('Error logging message: ', error);
            return [];
        }
    }


    static parseIPAddress(ip: string): string {

        if (ip.startsWith('::ffff:')) {
          ip = ip.substring(7);
        }

        return ip;
    }
}