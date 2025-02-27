import mongoose, { Document } from 'mongoose';

export interface TicketEntity extends Document {
    eventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | null;
    price: number;  
    type: string;
    status: string;
    purchasedAt: Date | null;
    createdAt: Date;
}

interface TicketSummary {
    type: string;
    price: number;
    availableCount: number;
}

const TicketSchema = new mongoose.Schema<TicketEntity>({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    price: { type: Number, required: true },  
    type: { type: String, required: true },
    status: { type: String, default: 'AVAILABLE' },
    purchasedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
});

const ticketDocument = mongoose.model<TicketEntity>('Ticket', TicketSchema);

class TicketsRepository {
    constructor() {
        this.createBulk = this.createBulk.bind(this);
        this.findAvailableTicket = this.findAvailableTicket.bind(this);
        this.getTicketSummaryByEventId = this.getTicketSummaryByEventId.bind(this);
        this.updateTicketAfterPayment = this.updateTicketAfterPayment.bind(this);
    }

    public async createBulk(
        eventId: string,
        price: number,
        type: string,
        quantity: number 
    ): Promise<TicketEntity[]> {
        const ticketsToInsert = [];
        for (let i = 0; i < quantity; i++) {
            ticketsToInsert.push({
                eventId: new mongoose.Types.ObjectId(eventId), 
                price: price,
                type: type, 
            });
        }

        return await ticketDocument.insertMany(ticketsToInsert);
    }

    public async findAvailableTicket(
        eventId: string,
        type: string,
        price: number
    ): Promise<TicketEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return null;
        }

        const ticket = await ticketDocument.findOne({
            eventId: new mongoose.Types.ObjectId(eventId),
            type: type,
            price: price,
            status: 'AVAILABLE', 
        });

        return ticket;
    }

    public async findById(id: string): Promise<TicketEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return ticketDocument.findById(new mongoose.Types.ObjectId(id));
    }

    public async getTicketSummaryByEventId(eventId: string): Promise<TicketSummary[]> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return [];
        }

        const summary = await ticketDocument.aggregate<TicketSummary>([
            { $match: { eventId: new mongoose.Types.ObjectId(eventId), status: 'AVAILABLE' } },
            {
                $group: {
                    _id: { type: '$type', price: '$price' },
                    availableCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    type: '$_id.type',
                    price: '$_id.price',
                    availableCount: 1,
                },
            },
        ]);

        return summary;
    }

    public async updateTicketAfterPayment(id: string, userId: string, status: string): Promise<TicketEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return null;
        }

        const updateFields: Partial<TicketEntity> = { status };
        updateFields.userId = new mongoose.Types.ObjectId(userId);
        updateFields.purchasedAt = new Date();

        return ticketDocument.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            { $set: updateFields },
            { new: true } 
        );
    }
}

export const ticketsRepository = new TicketsRepository();

