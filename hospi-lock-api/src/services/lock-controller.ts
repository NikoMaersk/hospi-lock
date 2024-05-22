import { ConnectionConfig } from "../config/connectionConfig";

export default class LockController {
    private static IP: string = process.env.IP || "10.176.69.22";
    private static PORT: string = process.env.PORT || "5000";


    static async unlockAsync(): Promise<{ success: boolean, message: string }> {
        return LockController.requestAsync('unlock');
    }

    static async lockAsync(): Promise<{ success: boolean, message: string }> {
        return LockController.requestAsync('lock');
    }

    private static async requestAsync(endpoint: string): Promise<{ success: boolean, message: string }> {

        try {
            const response = await fetch(`http://${LockController.IP}:${LockController.PORT}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);
            return { success: true, message: data }
        } catch (error) {
            console.error('Error: ', error);
            return { success: false, message: 'Failed to reach endpoint' }
        }
    }
}