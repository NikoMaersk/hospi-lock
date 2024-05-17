const { RedisClient } = require('./database-service')

export default class LogService {
    static async logMessage(email: string, authenticationStatus: boolean): Promise<{ success: boolean, message?: string, error?: string }> {
        try {
            const timestamp = Date.now();
            await RedisClient.sendCommand(['SELECT', '1']);

            const logEntry = {
                timestamp: timestamp.toString(),
                email: email,
                success: authenticationStatus
            }

            await RedisClient.zAdd('logs', [
                {
                  score: timestamp,
                  value: `email: ${email} | authenticated: ${authenticationStatus}`
                }
              ]);
            await RedisClient.sendCommand(['SELECT', '0']);
            return { success: true, message: 'Log added succesfully' };
        } catch (error) {
            console.error('Error logging message', error);
            return { success: false, error: "Failed to log message" };
        }
    }
}