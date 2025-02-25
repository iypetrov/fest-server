import { Router } from 'express';

import { paymentsController } from '../controllers/payments';
import { isClient } from '../middlewares/auth';

export default (router: Router) => {
    router.get('/payments', isClient, paymentsController.create);
    router.get('/payments/publishable-key', isClient, paymentsController.getPublishableKey);
    router.get('/payments/:id', isClient, paymentsController.getById);
};

