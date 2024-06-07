import { User } from "../models/user";
import { Admin } from "../models/admin";
import { NextFunction, Request, Response } from "express";
import { IRoleService } from "./interfaces/role-service";
import { BaseRole } from "../models/baseRole";

const jwt = require('jsonwebtoken');


export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}


export default class AuthService {

    private roleServices: Map<Role, IRoleService<BaseRole>>;

    public constructor(userService: IRoleService<User>, adminService: IRoleService<Admin>) {
        this.roleServices = new Map<Role, IRoleService<BaseRole>>();
        this.roleServices.set(Role.USER, userService);
        this.roleServices.set(Role.ADMIN, adminService);
    }


    public async authenticationAsync<T extends BaseRole>(email: string, password: string, role: Role):
        Promise<{ success: boolean, message: string, statusCode: number, role?: User | Admin }> {

        const roleService = this.roleServices.get(role) as IRoleService<T>;

        if (!roleService) {
            return { success: false, message: 'Invalid role', statusCode: 400 };
        }

        const verifyResult = await roleService.checkExistenceAsync(email);

        if (!verifyResult.success || !verifyResult.role) {
            return { success: false, message: `No registered ${role} with that email`, statusCode: 400 };
        }

        const tempRole = verifyResult.role;

        if (!tempRole.password || password !== tempRole.password) {
            return { success: false, message: 'Invalid password', statusCode: 401 };
        }

        return { success: true, message: 'OK', statusCode: 200, role: tempRole };
    }


    public verifyToken = (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.access_token;
        if (!token) {
            console.log('No token provided in cookies');
            return res.status(403).send('No token provided');
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('Failed to authenticate token:', err);
                return res.status(500).send('Failed to authenticate token');
            }

            req.email = decoded.email;
            req.role = decoded.role;
            next();
        });
    };


    public checkRole = (role: Role) => {
        return (req, res, next) => {
            if (req.role !== role) {
                console.log(`Access denied: role ${req.role} does not match ${role}`);
                return res.status(403).send('Access denied');
            }
            next();
        };
    };


    public generateToken = (email: string, role: Role) => {
        const payload = {
            email: email,
            role: role,
        };

        const options = {
            expiresIn: '12hr',
        }

        return jwt.sign(payload, process.env.JWT_SECRET, options);
    };


    public static emailValidator(email: string): boolean {
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return pattern.test(email);
    }
}