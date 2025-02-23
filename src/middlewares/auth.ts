import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
            console.error(err);
            if (err) {
                res.status(401).send('Unauthorized: Invalid token');
                return;
            }

            if (typeof decoded === 'object' && 'role' in decoded) {
                console.log(decoded.role);
                next();
            } else {
                res.status(400).json({ error: 'Invalid token payload' });
            }
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

