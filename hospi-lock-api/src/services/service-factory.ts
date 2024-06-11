import AuthService from "./auth-service";
import AdminService from "./database/admin-service";
import LockService from "./database/lock-service";
import LogService from "./database/log-service";
import UserService from "./database/user-service";
import LockController from "./lock-controller";


/**
 * Factory to easy instantiate the service classes
 */

export class ServiceFactory {
    
    private static instance: ServiceFactory;
    private userServiceInstance: UserService | null = null;
    private adminServiceInstance: AdminService | null = null;
    private authServiceInstance: AuthService | null = null;
    private logServiceInstance: LogService | null = null;
    private lockServiceInstance: LockService | null = null;
    private lockControllerInstance: LockController | null = null;

    private constructor() {}

    public static getInstance(): ServiceFactory {
        if (!this.instance) {
            this.instance = new ServiceFactory();
        }

        return this.instance;
    }


    public getUserService(): UserService {
        if (!this.userServiceInstance) {
            this.userServiceInstance = new UserService();
        }

        return this.userServiceInstance;
    }


    public getAdminService(): AdminService {
        if (!this.adminServiceInstance) {
            this.adminServiceInstance = new AdminService();
        }

        return this.adminServiceInstance;
    }


    public getAuthService(): AuthService {
        if (!this.authServiceInstance) {
            const userService = this.getUserService();
            const adminService = this.getAdminService();
            
            this.authServiceInstance = new AuthService(userService, adminService);
        }

        return this.authServiceInstance;
    }


    public getLogInstance(): LogService {
        if (!this.logServiceInstance) {
            this.logServiceInstance = new LogService();
        }

        return this.logServiceInstance;
    }


    public getLockService(): LockService {
        if (!this.lockServiceInstance) {
            const userService = this.getUserService();
            this.lockServiceInstance = new LockService(userService);
        }
        return this.lockServiceInstance;
    }


    public getLockController(): LockController {
        if (!this.lockControllerInstance) {
            const lockService = this.getLockService();
            this.lockControllerInstance = new LockController(lockService);
        }
        return this.lockControllerInstance;
    }


}