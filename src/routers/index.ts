import express from 'express';
import { Router } from 'express';

import auth from './auth';

const router = express.Router();

export default (): Router => {
    auth(router);
    return router;
}

