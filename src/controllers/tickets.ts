import { Request, Response } from 'express';
import { ticketsService } from '../services/tickets';

class TicketsController {
    constructor() {
        this.createBulk = this.createBulk.bind(this);
    }

    public async createBulk(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, price, type, quantity } = req.body;
            if (!eventId || !price || !type || quantity === undefined || quantity <= 0) {
                res.status(400).send('Invalid input data');
                return;
            }

            const createdTickets = await ticketsService.createBulk(eventId, price, type, quantity);
            if (createdTickets.length === 0) {
                res.status(400).send('Failed to create tickets');
                return;
            }

            res.status(201).json(createdTickets);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to create bulk tickets');
        }
    }
}

export const ticketsController = new TicketsController();

