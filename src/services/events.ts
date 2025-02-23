import { S3 } from 'aws-sdk';
import dotenv from 'dotenv';

import { eventsRepository } from '../repositories/events';

export interface EventModel {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    location: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
}

class EventsService {
    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.updateThumbnailUrl = this.updateThumbnailUrl.bind(this);
    }

    public async create(
        name: string, 
        description: string, 
        thumbnailUrl: string, 
        location: string, 
        startTime: Date, 
        endTime: Date, 
    ): Promise<EventModel| null> {
        const event = await eventsRepository.create(
            name, 
            description, 
            thumbnailUrl, 
            location, 
            startTime, 
            endTime
        );

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            thumbnailUrl: event.thumbnailUrl,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            createdAt: event.createdAt
        };
    }

    public async getAll(): Promise<EventModel[]> {
        const events = await eventsRepository.findAll();

        return events.map(event => ({
            id: event._id.toString(),  
            name: event.name,
            description: event.description,
            thumbnailUrl: event.thumbnailUrl,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            createdAt: event.createdAt
        }));
    }

    public async getById(id: string): Promise<EventModel| null> {
        const event = await eventsRepository.findById(id);
        if (!event) {
            return null;
        }

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            thumbnailUrl: event.thumbnailUrl,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            createdAt: event.createdAt
        };
    }

    public async updateThumbnailUrl(id: string, thumbnailUrl: string): Promise<EventModel| null> {
        const event = await eventsRepository.updateThumbnailUrl(id, thumbnailUrl);
        if (!event) {
            return null;
        }

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            thumbnailUrl: event.thumbnailUrl,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            createdAt: event.createdAt
        };
    }
}

export const eventsService = new EventsService();

