import { Router } from 'express';

import { ticketsController } from '../controllers/tickets';
import { isClient, isAdmin } from '../middlewares/auth';

export default (router: Router) => {
    router.post('/tickets', isAdmin, ticketsController.createBulk);
    router.get('/tickets/events/summary/:id', isClient, ticketsController.getTicketSummaryByEventId);
};

