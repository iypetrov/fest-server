import { Router } from 'express';

import { authController } from '../controllers/auth';

export default (router: Router) => {
    router.post('/register', authController.register);
    router.post('/login', authController.login);
};

