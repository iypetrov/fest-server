import { Router } from 'express';

import { ticketsController } from '../controllers/tickets';

export default (router: Router) => {
    router.post('/tickets', ticketsController.createBulk);
    router.get('/tickets/events/summary/:id', ticketsController.getTicketSummaryByEventId);
};

