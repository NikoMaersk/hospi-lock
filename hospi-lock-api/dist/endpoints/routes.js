"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_service_js_1 = require("../services/database-service.js");
const routes = (0, express_1.default)();
exports.routes = routes;
routes.use((0, cors_1.default)());
routes.use(express_1.default.static("public"));
routes.use(body_parser_1.default.urlencoded({ extended: false }));
routes.use(body_parser_1.default.json());
routes.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const email = user.email.toLowerCase();
    const { password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const tempUser = yield database_service_js_1.RedisClient.hGetAll(email);
        const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;
        if (userAlreadyExists) {
            return res.status(400).send('User already exists');
        }
        let now = new Date();
        yield database_service_js_1.RedisClient.hSet(email, {
            password: password,
            first_name: firstName,
            last_name: lastName,
            reg_date: now.toISOString(),
        });
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send('A server error occurred');
    }
}));
routes.get('/users/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    const lowerCaseEmail = email.toLowerCase();
    try {
        const tempUser = yield database_service_js_1.RedisClient.hGetAll(lowerCaseEmail);
        if (Object.keys(tempUser).length === 0) {
            return res.status(400).send('No registered user with that email');
        }
        const user = {
            email: lowerCaseEmail,
            password: tempUser.password,
            firstName: tempUser.first_name,
            lastName: tempUser.last_name,
            date: tempUser.reg_date
        };
        return res.status(200).json(user);
    }
    catch (error) {
        const errorMessage = 'Error fetching email';
        console.error(`${errorMessage} : `, error);
        return res.status(500).send(errorMessage);
    }
}));
routes.post('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const tempUser = yield database_service_js_1.RedisClient.hGetAll(email.toLowerCase());
        const userExists = tempUser && Object.keys(tempUser).length > 0;
        if (!userExists) {
            return res.status(400).send('No registered user with that email');
        }
        if (password !== tempUser.password) {
            return res.status(401).send('Invalid password');
        }
        return res.status(200).send('OK');
    }
    catch (error) {
        const errorMessage = 'Internal server error';
        console.error(`${errorMessage} : `, error);
        return res.status(500).send(errorMessage);
    }
}));
routes.get('/users/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keys = yield database_service_js_1.RedisClient.keys("*");
        const allHashes = {};
        for (const key of keys) {
            const hashValues = yield database_service_js_1.RedisClient.hGetAll(key);
            allHashes[key] = hashValues;
        }
        return res.status(200).json(allHashes);
    }
    catch (error) {
        const errorMessage = 'Error fetching users';
        console.error(`${errorMessage} : `, error);
        return res.status(500).send(errorMessage);
    }
}));
routes.get('/health', (req, res) => {
    res.status(200).send('OK');
});
routes.get('*', (req, res) => {
    return res.status(404).send('no such route');
});
//# sourceMappingURL=routes.js.map