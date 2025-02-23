import { Request, Response } from 'express';

import { eventsService } from '../services/events';
import { imagesService } from '../services/images';

class EventsController {
    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getThumbnailById = this.getThumbnailById.bind(this);
    }

    public async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, location, startTime, endTime } = req.body;
            if (!name || !description || !location || !startTime || !endTime) {
                res.status(400).send('All events fields are required');
                return;
            }

            const event = await eventsService.create(
                name,
                description,
                null,
                location,
                new Date(startTime),
                new Date(endTime)
            );

            if (!event) {
                res.status(500).send('Failed to create event');
                return;
            }

            res.status(201).json(event);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).send('Failed to create event');
        }
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const events = await eventsService.getAll();
            res.status(200).json(events);
        } catch (error) {
            console.error('Error getting event:', error);
            res.status(500).send('Failed to get event');
        }
    }

    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).send('Event id is required');
                return;
            }

            const event = await eventsService.getById(id);
            if (!event) {
                res.status(404).send('Event not found');
                return;
            }

            res.status(200).json(event);
        } catch (error) {
            console.error('Error getting event:', error);
            res.status(500).send('Failed to get event');
        }
    }

    public async getThumbnailById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).send('Thumbnail id is required');
                return;
            }

            const image = await imagesService.get('events', id);
            if (!image) {
                res.status(404).send('Event\'s thumbnail does not exist');
                return;
            }

            res.setHeader('Content-Type', image.contentType);
            res.send(image.buffer);
        } catch (error) {
            console.error('Error fetching event\'s thumbnail:', error);
            res.status(500).send('Failed to get event thumbnail');
        }
    }

    public async uploadThumbnail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).send('Event id is required');
                return;
            }

            if (!req.file) {
                res.status(400).send('Thumbnail file is required');
                return;
            }
            const thumbnailUrl = await imagesService.upload('events', id, req.file);
            if (!thumbnailUrl) {
                res.status(500).send('Thumbnail failed to upload');
                return;
            }

            const event = await eventsService.updateThumbnailUrl(id, thumbnailUrl);
            if (!event) {
                res.status(500).send('Failed to update event\'s thumbnail');
                return;
            }

            res.status(201).json(event);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).send('Failed to create event');
        }
    }
}

export const eventsController = new EventsController();

