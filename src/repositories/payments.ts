import mongoose, { Document } from 'mongoose';

export interface PaymentEntity extends Document {
    userId: mongoose.Types.ObjectId;
    ticketId: mongoose.Types.ObjectId;
    providerId: string;
    price: number;
    createdAt: Date;
    finishedAt: Date | null;
}

const PaymentSchema = new mongoose.Schema<PaymentEntity>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    providerId: { type: String, required: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
});

const paymentDocument = mongoose.model<PaymentEntity>('Payment', PaymentSchema);

class PaymentsRepository {
    constructor() {
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.setFinishedAtByTicketId = this.setFinishedAtByTicketId.bind(this);
    }

    public async create(
        userId: string,
        ticketId: string,
        providerId: string,
        price: number
    ): Promise<PaymentEntity> {
        return new paymentDocument({
            userId: new mongoose.Types.ObjectId(userId),
            ticketId: new mongoose.Types.ObjectId(ticketId),
            providerId,
            price,
        }).save();
    }

    public async findById(id: string): Promise<PaymentEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return paymentDocument.findById(new mongoose.Types.ObjectId(id));
    }

    public async setFinishedAtByTicketId(ticketId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            return;
        }

        await paymentDocument.updateOne(
            { ticketId: new mongoose.Types.ObjectId(ticketId) },
            { $set: { finishedAt: new Date() } }
        );
    }
}

export const paymentsRepository = new PaymentsRepository();

