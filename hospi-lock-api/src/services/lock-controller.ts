import { Lock, LockRequest } from "../models/lock";
import LockService from "./database/lock-service";

export enum Locking {
    LOCK,
    UNLOCK,
}

export default class LockController {

    private static PORT: string = process.env.PORT;

    static async lockingAsync(email: string, lock: Locking): Promise<{ success: boolean, message: string | unknown }> {
        const lockRequest: LockRequest = await LockService.getLockByEmail(email);
        const tempLock: Lock = lockRequest.lock;

        if (!tempLock) {
            return { success: false, message: 'Could not get associated lock' }
        }

        const IP: string = tempLock.ip;

        if (!IP || IP.trim() === "") {
            return { success: false, message: "Could not get ip" }
        }

        let endpoint: string = '';

        switch (lock) {
            case Locking.LOCK:
                endpoint = 'lock';
                break;
            case Locking.UNLOCK:
                endpoint = 'unlock';
                break;
            default:
                return;
        }

        const postRequest = await LockController.requestAsync(IP, endpoint);

        if (postRequest.success) {
            await LockService.setStatusAsync(lockRequest.lock, !lockRequest.lock.status);
        }

        return postRequest;
    }


    private static async requestAsync(IP: string, endpoint: string): Promise<{ success: boolean, message: string | unknown }> {

        try {
            const response = await fetch(`http://${IP}:${LockController.PORT}/${endpoint}`, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
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