import { Lock, LockRequest } from "../models/lock";
import LockService from "./database/lock-service";

export enum Locking {
    LOCK,
    UNLOCK,
}


/**
 * Handles http request to the lock
 */

export default class LockController {

    private static PORT: string = process.env.PORT;
    private lockService: LockService;

    public constructor(lockService: LockService) {
        this.lockService = lockService;
    }

    /**
     * Sends request to lock
     * @param email user making the request
     * @param lock enum representing wether the lock should unlock/lock
     * @returns success status
     */

    public async lockingByEmailAsync(email: string, lock: Locking): Promise<{ success: boolean, message: string | unknown }> {
        const lockRequest: LockRequest = await this.lockService.getLockByEmail(email);
        const tempLock: Lock = lockRequest.lock;

        console.log(`Lock id: ${tempLock.id}, lock IP: ${tempLock.ip}`)

        if (!tempLock || tempLock.id === undefined) {
            return { success: false, message: 'Could not get associated lock' }
        }

        const ip: string = tempLock.ip;

        if (!ip || ip.trim() === "") {
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
        }

        console.log(`Sending ${endpoint} request`);

        const postRequest = await this.requestAsync(ip, endpoint);

        if (postRequest.success) {
            await this.lockService.setStatusAsync(lockRequest.lock, !lockRequest.lock.status);
        }

        return postRequest;
    }



    public async lockingByIdAsync(id: string, lock: Locking): Promise<{ success: boolean, message: string | unknown }> {
        const lockRequest: LockRequest = await this.lockService.getLockByIdAsync(id);

        if (!lockRequest.success) {
            return { success: false, message: lockRequest.message };
        }

        const ip: string = lockRequest.lock?.ip;
        let endpoint: string = "";

        switch (lock) {
            case Locking.UNLOCK:
                endpoint = 'unlock';
                break;
            case Locking.LOCK:
                endpoint = 'lock';
                break;
        }

        const postRequest = await this.requestAsync(ip, endpoint);

        if (postRequest.success) {
            await this.lockService.setStatusAsync(lockRequest.lock, !lockRequest.lock.status);
        }

        return postRequest;

    }


    private async requestAsync(ip: string, endpoint: string): Promise<{ success: boolean, message: string | unknown }> {
        console.log(`Attempting to ${endpoint}, for ip: ${ip}`)
        try {
            const response = await fetch(`http://${ip}:${LockController.PORT}/${endpoint}`, {
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