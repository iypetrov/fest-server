import { Router } from 'express';
import multer from 'multer';

import { eventsController } from '../controllers/events';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default (router: Router) => {
    router.post('/events', upload.single('file'), eventsController.create);
    router.get('/events', eventsController.getAll);
    router.get('/events/:id', eventsController.getById);
    router.get('/events/:id/thumbnail', eventsController.getThumbnailById);
    router.put('/events/:id/thumbnail', upload.single('file'), eventsController.uploadThumbnail);
};

