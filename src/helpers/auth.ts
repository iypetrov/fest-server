import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const ENV = process.env.ENV;
const JWT_SECRET = process.env.JWT_SECRET || "";
export const COOKIE_NAME = 'FEST_JWT_TOKEN';

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export const generateJwtToken = async (secret: string, id: string, email: string, role: string): Promise<string | null> => {
    try {
        const hmac = crypto.createHmac('sha256', secret).update(secret).digest('hex');
        return await jwt.sign(
            { id, email, role } as JwtPayload,
            hmac,
            { expiresIn: '8h' }
        );
    } catch (error) {
        console.error("Error generating token:", error);
        return null;
    }
};

export const decodeJwtToken = async (req: Request): Promise<JwtPayload | null> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];
        const hmac = crypto.createHmac('sha256', JWT_SECRET).update(JWT_SECRET).digest('hex');

        return new Promise((resolve, reject) => {
            jwt.verify(token, hmac, (err, decoded) => {
                if (err) {
                    console.error("JWT verification error:", err);
                    resolve(null);
                } else {
                    resolve(decoded as JwtPayload);
                }
            });
        });
    } catch (error) {
        console.error('JWT authentication error:', error);
        return null;
    }
};

