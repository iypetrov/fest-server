import { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { Role, usersService } from '../services/users';
import { generateJwtToken } from '../helpers/auth';

dotenv.config();

const ENV = process.env.ENV;
const JWT_SECRET = process.env.JWT_SECRET || "";
export const COOKIE_NAME = 'FEST_JWT_TOKEN';

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).send('Email and password are required');
                return;
            }

            const existingUser = await usersService.getByEmail(email);
            if (existingUser) {
                res.status(400).send('User already exists');
                return;
            }

            const user = await usersService.create(email, password);
            if (!user) {
                res.status(500).send('Failed to create a user');
                return;
            }

            const token = await generateJwtToken(JWT_SECRET, user.id, email, Role.CLIENT);
            if (!token) {
                res.status(500).send('Failed to generate token');
                return;
            }

            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(201).json({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
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

            const user = await usersService.getByEmail(email);
            if (!user) {
                res.status(400).send("User doesn't exist");
                return;
            }

            const validPassword = await usersService.validatePassword(email, password);
            if (!validPassword) {
                res.status(400).send('Invalid password');
                return;
            }

            const token = await generateJwtToken(JWT_SECRET, user.id, email, Role.CLIENT);
            if (!token) {
                res.status(500).send('Failed to generate token');
                return;
            }

            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(200).json({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
            res.status(500).send('Failed to login');
        }
    }
}

export const authController = new AuthController();

