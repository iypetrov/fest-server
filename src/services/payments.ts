import { paymentsRepository } from '../repositories/payments';
import dotenv from 'dotenv';

dotenv.config();

export interface PaymentModel {
    id: string;
    userId: string; 
    ticketId: string;
    providerId: string;
    price: number;
    createdAt: Date;
    finishedAt: Date | null;
}

class PaymentsService {
    constructor() {
        this.create = this.create.bind(this);
        this.getById = this.getById.bind(this);
        this.getPublishableKey = this.getPublishableKey.bind(this);
    }

    public async create(
        userId: string,
        ticketId: string,
        price: number,
    ): Promise<PaymentModel| null> {
        const providerId = "";
        const payment = await paymentsRepository.create(
            userId,
            ticketId,
            providerId,
            price
        );

        return {
            id: payment.id,
            userId: payment.userId.toString(),
            ticketId: payment.ticketId.toString(),
            providerId: payment.providerId,
            price: payment.price,
            createdAt: payment.createdAt,
            finishedAt: payment.finishedAt,
        };
    }

    public async getById(id: string): Promise<PaymentModel| null> {
        const payment = await paymentsRepository.findById(id);
        if (!payment) {
            return null;
        }

        return {
            id: payment.id,
            userId: payment.userId.toString(),
            ticketId: payment.ticketId.toString(),
            providerId: payment.providerId,
            price: payment.price,
            createdAt: payment.createdAt,
            finishedAt: payment.finishedAt,
        };
    }

    public async getPublishableKey(): Promise<string> {
        return process.env.STRIPE_PUBLISHABLE_KEY;
    }
}

export const paymentsService = new PaymentsService();

