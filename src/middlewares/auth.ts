import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { Role } from '../services/users';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "";

export async function isClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).send('Unauthorized: No token provided');
            return;
        }

        const token = authHeader.split(" ")[1]; 
        const hmac = crypto.createHmac('sha256', JWT_SECRET).update(JWT_SECRET).digest('hex');
        jwt.verify(token, hmac, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
            if (err) {
                res.status(401).send('Unauthorized: Invalid token');
                return;
            }

            if (typeof decoded === 'object' && 'role' in decoded) {
                console.log(decoded.role);
                if (decoded.role !== Role.CLIENT) {
                    res.status(403).json({ error: 'Only client users have access to this' });
                } else {
                    next();
                }
            } else {
                res.status(400).json({ error: 'Invalid token payload' });
            }
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).send('Unauthorized: No token provided');
            return;
        }

        const token = authHeader.split(" ")[1]; 
        const hmac = crypto.createHmac('sha256', JWT_SECRET).update(JWT_SECRET).digest('hex');
        jwt.verify(token, hmac, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
            if (err) {
                res.status(401).send('Unauthorized: Invalid token');
                return;
            }

            if (typeof decoded === 'object' && 'role' in decoded) {
                console.log(decoded.role);
                if (decoded.role !== Role.ADMIN) {
                    res.status(403).json({ error: 'Only admin users have access to this' });
                } else {
                    next();
                }
            } else {
                res.status(400).json({ error: 'Invalid token payload' });
            }
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

