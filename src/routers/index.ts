import express from 'express';
import { Router } from 'express';

import auth from './auth';
import events from './events';

const router = express.Router();

export default (): Router => {
    auth(router);
    events(router);
    return router;
}

