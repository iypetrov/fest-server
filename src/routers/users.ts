import { Router } from 'express';

import { usersController } from '../controllers/users';
import { isClient } from '../middlewares/auth';

export default (router: Router) => {
    router.get('/users/:id', isClient, usersController.getUserById);
};

