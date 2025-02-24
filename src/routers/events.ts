import { Router } from 'express';
import multer from 'multer';

import { eventsController } from '../controllers/events';
import { isClient, isAdmin } from '../middlewares/auth';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default (router: Router) => {
    router.post('/events', isAdmin, upload.single('file'), eventsController.create);
    router.get('/events', isClient, eventsController.getAll);
    router.get('/events/:id', isClient, eventsController.getById);
    router.get('/events/:id/thumbnail', isClient, eventsController.getThumbnailById);
    router.put('/events/:id/thumbnail', isAdmin, upload.single('file'), eventsController.uploadThumbnail);
};

