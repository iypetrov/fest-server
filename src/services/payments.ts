import dotenv from 'dotenv';
import Stripe from 'stripe';

import { paymentsRepository } from '../repositories/payments';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});


export interface PaymentModel {
    clientSecret: string,
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
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100, 
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const payment = await paymentsRepository.create(
            userId,
            ticketId,
            paymentIntent.id,
            price
        );

        return {
            clientSecret: paymentIntent.client_secret,
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
            clientSecret: "",
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

