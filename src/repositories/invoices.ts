import mongoose, { Document } from 'mongoose';

export interface InvoiceEntity extends Document {
    paymentId: mongoose.Types.ObjectId;
    createdAt: Date;
    sentAt: Date | null;
}

const InvoiceSchema = new mongoose.Schema<InvoiceEntity>({
    paymentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Payment' },
    createdAt: { type: Date, default: Date.now },
    sentAt: { type: Date, default: null },
});

const invoiceDocument = mongoose.model<InvoiceEntity>('Invoice', InvoiceSchema);

class InvoicesRepository {
    constructor() {
        this.create = this.create.bind(this);
        this.findByPaymentIdAndMarkAsSent = this.findByPaymentIdAndMarkAsSent.bind(this);
    }

    public async create(paymentId: string): Promise<InvoiceEntity> {
        return new invoiceDocument({ paymentId: new mongoose.Types.ObjectId(paymentId) }).save();
    }

    public async findByPaymentIdAndMarkAsSent(paymentId: string): Promise<InvoiceEntity | null> {
        return invoiceDocument.findOneAndUpdate(
            { paymentId: new mongoose.Types.ObjectId(paymentId) },
            { sentAt: new Date() },
            { new: true }
        );
    }
}

export const invoicesRepository = new InvoicesRepository();

