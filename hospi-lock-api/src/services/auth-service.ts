import { User, UserRequest } from "../models/user";
import { Admin, AdminRequest } from "../models/admin";
import { RedisClientDb0, RedisClientDb1 } from "./database/database-service";
import { NextFunction, Request, Response } from "express";

const jwt = require('jsonwebtoken');


export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

export default class AuthService {
    static async authenticationAsync(email: string, password: string, role: Role): Promise<{ success: boolean, message: string, statusCode: number, role?: User | Admin }> {

        try {
            const verifyResult = await AuthService.checkExistenceAsync(email, role);

            if (!verifyResult.success) {
                return { success: verifyResult.success, message: verifyResult.message, statusCode: verifyResult.statusCode };
            }

            const tempRole: User | Admin = verifyResult.user;

            if (password !== tempRole.password) {
                return { success: false, message: 'Invalid password', statusCode: 401 };
            }

            return { success: true, message: 'OK', statusCode: 200, role: tempRole };

        } catch (error) {
            console.error('Internal server error: ', error);
            return { success: false, message: 'Internal server error', statusCode: 500 };
        }
    }


    static async checkExistenceAsync(email: string, role: Role): Promise<UserRequest | AdminRequest> {

        if (!email) {
            return { success: false, message: 'Missing required field', statusCode: 400 };
        }

        if (!this.emailValidator(email)) {
            return { success: false, message: 'Not a valid email', statusCode: 400 };
        }

        let result: UserRequest | AdminRequest;

        switch (role) {
            case Role.USER:
                result = await this.checkUserExistenceAsync(email);
                break;
            case Role.ADMIN:
                result = await this.checkAdminExistenceAsync(email);
                break;
            default:
                result = { success: false, message: 'Missing role', statusCode: 500 };
        }

        return result;
    }


    static async checkUserExistenceAsync(email: string): Promise<UserRequest> {

        const tempUser = await RedisClientDb0.hGetAll(`user:${email.toLowerCase()}`);
        const userExists: boolean = tempUser && Object.keys(tempUser).length > 0;

        if (!userExists) {
            return { success: false, message: 'No registered user with that email', statusCode: 400 };
        }

        const user: User = {
            email: tempUser.email,
            password: tempUser.password,
            firstName: tempUser.first_name,
            lastName: tempUser.last_name,
            date: tempUser.reg_date,
            lockId: tempUser.lock_id
        }

        return { success: true, message: 'OK', statusCode: 200, user: user };
    }


    static async checkAdminExistenceAsync(email: string): Promise<AdminRequest> {
        const tempAdmin = await RedisClientDb1.hGetAll(`admin:${email}`);

        const adminExists: boolean = tempAdmin && Object.keys(tempAdmin).length > 0;

        if (!adminExists) {
            return { success: false, message: 'No registered admin with that email', statusCode: 400 };
        }

        const admin: Admin = {
            email: tempAdmin.email,
            password: tempAdmin.password,
        }

        return { success: true, message: 'OK', statusCode: 200, user: admin };
    }


    static verifyToken = (req: Request, res: Response, next: NextFunction) => {
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


    static checkRole = (role: Role) => {
        return (req, res, next) => {
            if (req.role !== role) {
                console.log(`Access denied: role ${req.role} does not match ${role}`);
                return res.status(403).send('Access denied');
            }
            next();
        };
    };


    static generateToken = (email: string, role: Role) => {
        const payload = {
            email: email,
            role: role,
        };

        const options = {
            expiresIn: '12hr',
        }

        return jwt.sign(payload, process.env.JWT_SECRET, options);
    };


    static emailValidator(email: string): boolean {
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return pattern.test(email);
    }
}