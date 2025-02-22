import { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { Role, usersService } from '../services/users';

dotenv.config();

const ENV = process.env.ENV;
const JWT_SECRET = process.env.JWT_SECRET || "";
export const COOKIE_NAME = 'FEST_JWT_TOKEN';

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    private generateJwtToken(secret: string, email: string, role: string): string | null {
        const hmac = crypto.createHmac('sha256', secret).update(secret).digest('hex');
        try {
            return jwt.sign(
                { email, role },
                hmac,
                { expiresIn: '8h' }
            );
        } catch (error) {
            console.error("Error generating token:", error);
            return null;
        }
    }

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).send('Email and password are required');
                return;
            }

            const existingUser = await usersService.getUserByEmail(email);
            if (existingUser) {
                res.status(400).send('User already exists');
                return;
            }

            const token = this.generateJwtToken(JWT_SECRET, email, Role.CLIENT);
            if (!token) {
                res.status(500).send('Failed to generate token');
                return;
            }

            const user = await usersService.createUser(email, password);
            if (!user) {
                res.status(500).send('Failed to create a user');
                return;
            }

            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(201).json({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to register');
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).send('Email and password are required');
                return;
            }

            const user = await usersService.getUserByEmail(email);
            if (!user) {
                res.status(400).send("User doesn't exist");
                return;
            }

            const validPassword = await usersService.validatePassword(email, password);
            if (!validPassword) {
                res.status(400).send('Invalid password');
                return;
            }

            const token = this.generateJwtToken(JWT_SECRET, email, Role.CLIENT);
            if (!token) {
                res.status(500).send('Failed to generate token');
                return;
            }

            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(200).json({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to login');
        }
    }
}

export const authController = new AuthController();

