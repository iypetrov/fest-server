import { Request, Response } from 'express';

import { paymentsService } from '../services/payments';
import { ticketsService } from '../services/tickets';
import { usersService } from '../services/users';
import { decodeJwtToken, JwtPayload } from '../helpers/auth';

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

            const event = await paymentsService.create(userId, ticketId, ticket.price);
            if (!event) {
                res.status(404).send('Payment not found');
                return;
            }

            res.status(200).json(event);
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).send('Failed to get payment');
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
        const publishableKey = paymentsService.getPublishableKey();
        res.status(200).json({publishableKey: publishableKey});
    }
}

export const paymentsController = new PaymentsController();

