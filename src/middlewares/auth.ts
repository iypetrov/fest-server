import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { decodeJwtToken, JwtPayload  } from '../helpers/auth';
import { Role } from '../services/users';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function isClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const payload = await decodeJwtToken(req);
        if (!payload) {
            res.status(401).send('Unauthorized: Not valid token');
            return;
        }

        if (payload.role !== Role.CLIENT) {
            res.status(403).json({ error: 'Only client users have access to this' });
        } else {
            next();
        }
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const payload = await decodeJwtToken(req);
        if (!payload) {
            res.status(401).send('Unauthorized: Not valid token');
            return;
        }

        if (payload.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Only admin users have access to this' });
        } else {
            next();
        }
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

