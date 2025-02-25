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
    thumbnailUrl: { type: String },
    location: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});

const eventDocument = mongoose.model<EventEntity>('Event', EventSchema);

class EventsRepository {
    constructor() {
        this.create = this.create.bind(this);
        this.findAll= this.findAll.bind(this);
        this.findById = this.findById.bind(this);
        this.updateThumbnailUrl = this.updateThumbnailUrl.bind(this);
    }

    public async create(
        name: string,
        description: string,
        thumbnailUrl: string,
        location: string,
        startTime: Date,
        endTime: Date
    ): Promise<EventEntity> {
        return new eventDocument({ name, description, thumbnailUrl, location, startTime, endTime }).save();
    }
    
    public async findAll(): Promise<EventEntity[]> {
        return eventDocument.find();
    }

    public async findById(id: string): Promise<EventEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return eventDocument.findById(new mongoose.Types.ObjectId(id));
    }

    public async updateThumbnailUrl(id: string, thumbnailUrl: string): Promise<EventEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const updatedEvent = await eventDocument.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            { thumbnailUrl: thumbnailUrl },
            { new: true }  
        );

        return updatedEvent;
    }
}

export const eventsRepository = new EventsRepository();

