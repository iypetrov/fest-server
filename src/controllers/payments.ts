import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';

import { paymentsService } from '../services/payments';
import { ticketsService } from '../services/tickets';
import { usersService } from '../services/users';
import { decodeJwtToken, JwtPayload } from '../helpers/auth';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});

class PaymentsController {
    constructor() {
        this.create = this.create.bind(this);
        this.getById = this.getById.bind(this);
        this.getPublishableKey = this.getPublishableKey.bind(this);
    }

    public async create(req: Request, res: Response): Promise<void> {
        try {
            const { userId, ticketId } = req.body;
            if (!userId || !ticketId) {
                res.status(400).send('All payments fields are required');
                return;
            }

            const jwtPayload = await decodeJwtToken(req);
            if (!jwtPayload) {
                res.status(400).send('Can\'t create payment as anonymous user');
                return;
            }

            if (jwtPayload.id !== userId) {
                res.status(400).send('Can\'t create payment for another user');
                return;
            }

            const ticket = await ticketsService.getById(ticketId);
            if (!ticket) {
                res.status(400).send('There is no such ticket with this id');
                return;
            }

            const payment = await paymentsService.create(userId, ticketId, Math.round(ticket.price * 100));
            if (!payment) {
                res.status(404).send('Payment failed to create');
                return;
            }

            res.status(200).json(payment);
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).send('Failed to create payment');
        }
    }

    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).send('Payment id is required');
                return;
            }

            const payment = await paymentsService.getById(id);
            if (!payment) {
                res.status(404).send('Payment not found');
                return;
            }

            const jwtPayload = await decodeJwtToken(req);
            if (!jwtPayload) {
                res.status(400).send('Can\'t view payment as anonymous user');
                return;
            }

            if (jwtPayload.id !== payment.id) {
                res.status(400).send('Can\'t view payment for another user');
                return;
            }

            res.status(200).json(payment);
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).send('Failed to get payment');
        }
    }

    public async getPublishableKey(req: Request, res: Response): Promise<void> {
        const publishableKey = await paymentsService.getPublishableKey();
        res.status(200).json({publishableKey: publishableKey});
    }

    public async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            const sig = req.headers["stripe-signature"];
            if (!sig) {
                res.status(400).send("Missing Stripe signature");
                return;
            }

            const event = stripe.webhooks.constructEvent(
                req.body, 
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );

            switch (event.type) {
                case "payment_intent.succeeded": {
                    const intent = event.data.object as Stripe.PaymentIntent;

                    paymentsService.handleWebhookEvent(intent.id)
                    .then(() => console.log("Webhook processed successfully"))
                    .catch(error => console.error("Error processing webhook:", error));

                    res.status(200).send("Received");  
                    return;
                }
            }

            res.status(200).send("Unhandled event type");  
            return;
        } catch (error) {
            console.error('Error handling webhook event:', error);
            res.status(400).send(`Webhook Error: ${error.message}`);
            return;
        }
    }
}

export const paymentsController = new PaymentsController();

