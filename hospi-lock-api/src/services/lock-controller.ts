
export default class LockController {
    private static TEMP_IP = "";
    private static PORT = "";

    static async unlockAsync(): Promise<{ success: boolean, message: string}>  {
        return LockController.requestAsync('unlock');
    }

    static async lockAsync(): Promise<{ success: boolean, message: string}> {
        return LockController.requestAsync('lock');
    }

    private static async requestAsync(endpoint: string): Promise<{ success: boolean, message: string}> {
        try {
            const response = await fetch(`http://${this.TEMP_IP}:${this.PORT}/${endpoint}`, {
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
           return { success: true, message: data}
        } catch (error) {
            console.error('Error: ', error);
            return { success: false, message: 'Failed to reach endpoint'}
        }
    }

}