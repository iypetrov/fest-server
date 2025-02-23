import mongoose, { Document } from 'mongoose';

export interface EventEntity extends Document {
    name: string;
    description: string;
    thumbnailUrl: string;
    location: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
}

const EventSchema = new mongoose.Schema<EventEntity>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    location: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});

const eventDocument = mongoose.model<EventEntity>('Event', EventSchema);

class EventsRepository {
    constructor() {
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
    }

    async create(
        name: string,
        description: string,
        thumbnailUrl: string,
        location: string,
        startTime: Date,
        endTime: Date
    ): Promise<EventEntity> {
        return new eventDocument({ name, description, thumbnailUrl, location, startTime, endTime }).save();
    }

    async findById(id: string): Promise<EventEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid event id:', id);
            return null;
        }
        return eventDocument.findById(new mongoose.Types.ObjectId(id));
    }
}

export const eventsRepository = new EventsRepository();

