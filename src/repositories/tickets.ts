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
            console.log('Invalid event id:', eventId);
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
}

export const ticketsRepository = new TicketsRepository();

