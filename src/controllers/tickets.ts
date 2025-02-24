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

    public async getTicketSummaryByEventId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).send('Event id is not provided');
                return;
            }

            const summary = await ticketsService.getTicketSummaryByEventId(id);
            if (!summary) {
                res.status(400).send('No ticket\'s summary for event');
                return;
            }

            res.status(200).json(summary);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get ticket\'s summary for event');
        }
    }
}

export const ticketsController = new TicketsController();

