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
        console.log(`Token: ${token}`);
        console.log(`Secret: ${JWT_SECRET}`);
        jwt.verify(token, hmac, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
            console.log(err);
            if (err) {
                res.status(401).send('Unauthorized: Invalid token');
                return;
            }

            console.log('Decoded JWT:', decoded);
            next();
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        res.status(500).send('Failed to validate JWT token');
    }
}

