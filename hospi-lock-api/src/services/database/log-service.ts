import { Log } from "../../models/log";
import { RedisClientDb1 } from "../database-service";

export interface LogRequest {
    success: boolean,
    message?: string,
    log?: Log
}

export default class LogService {
    static async logMessageAsync(email: string, authenticationStatus: boolean, ip: string): Promise<LogRequest> {
        try {
            const timestamp = Date.now();

            const parsedIp = this.parseIPAddress(ip);

            const logEntry = {
                timestamp: timestamp.toString(),
                email: email,
                ip: parsedIp,
                success: authenticationStatus
            }

            const logEntrySerialized = JSON.stringify(logEntry);

            await RedisClientDb1.zAdd('logs', [
                {
                    score: timestamp,
                    value: logEntrySerialized,
                }
            ]);

            return { success: true, message: 'Log added succesfully' };
        } catch (error) {
            console.error('Error logging message: ', error);
            return { success: false, message: "Failed to log message" };
        }
    }


    static async getAllLogsAsync(): Promise<Log[]> {

        try {
            const data = await RedisClientDb1.zRange('logs', 0, -1);

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


    static parseIPAddress(ip: string): string {

        if (ip.startsWith('::ffff:')) {
          ip = ip.substring(7);
        }

        return ip;
    }
}