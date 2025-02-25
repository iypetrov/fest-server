import { availableMemory } from 'process';
import { ticketsRepository } from '../repositories/tickets';

export enum Status {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    SOLD = 'SOLD',
}

export enum Type {
    STANDARD = 'STANDARD',
    VIP = 'VIP',
}

const getTicketStatusFromString = (status: string): Status | null => {
    return Object.values(Status).includes(status as Status) ? (status as Status) : null;
};

const getTicketTypeFromString = (type: string): Type | null => {
    return Object.values(Type).includes(type as Type) ? (type as Type) : null;
};

export interface TicketModel {
    id: string;
    eventId: string;
    userId: string;
    price: number;
    type: Type;
    status: Status;
    purchasedAt: Date;
    createdAt: Date;
}

export interface TicketSummaryModel {
    type: Type;
    price: number;
    availableCount: number;
}

class TicketsService {
    constructor() {
        this.createBulk = this.createBulk.bind(this);
        this.getAvailableTicket = this.getAvailableTicket.bind(this);
    }

    public async createBulk(
        eventId: string,
        price: number,
        type: string,
        quantity: number
    ): Promise<TicketModel[]> {
        const ticketType = getTicketTypeFromString(type);
        if (!ticketType || quantity <= 0) {
            return [];
        }

        const createdTickets = await ticketsRepository.createBulk(
            eventId,
            price,
            type,
            quantity
        );
        if (!createdTickets || createdTickets.length === 0) {
            return [];
        }

        return createdTickets.map(ticket => ({
            id: ticket.id,
            eventId: ticket.eventId.toString(),
            userId: ticket.userId?.toString(),
            price: ticket.price,  
            type: getTicketTypeFromString(ticket.type),
            status: getTicketStatusFromString(ticket.status),
            purchasedAt: ticket.purchasedAt,
            createdAt: ticket.createdAt,
        }));
    }

    public async getAvailableTicket(
        eventId: string,
        price: number,
        type: string
    ): Promise<TicketModel | null> {
        const ticketType = getTicketTypeFromString(type);
        if (!ticketType) {
            return null;
        }

        const ticket = await ticketsRepository.findAvailableTicket(
            eventId,
            ticketType,
            price
        );
        if (!ticket) {
            return null;
        }

        return {
            id: ticket.id,
            eventId: ticket.eventId.toString(),
            userId: ticket.userId?.toString(),
            price: ticket.price,
            type: getTicketTypeFromString(ticket.type),
            status: getTicketStatusFromString(ticket.status),
            purchasedAt: ticket.purchasedAt,
            createdAt: ticket.createdAt,
        };
    }

    public async getById(id: string): Promise<TicketModel| null> {
        const ticket = await ticketsRepository.findById(id);
        if (!ticket) {
            return null;
        }

        return {
            id: ticket.id,
            eventId: ticket.eventId.toString(),
            userId: ticket.userId?.toString(),
            price: ticket.price,
            type: getTicketTypeFromString(ticket.type),
            status: getTicketStatusFromString(ticket.status),
            purchasedAt: ticket.purchasedAt,
            createdAt: ticket.createdAt,
        };
    }

    public async getTicketSummaryByEventId(eventId: string): Promise<TicketSummaryModel[] | null> {
        const ticketsSummary = await ticketsRepository.getTicketSummaryByEventId(eventId);

        return ticketsSummary.map((summary) => ({
            type: getTicketTypeFromString(summary.type), 
            price: summary.price, 
            availableCount: summary.availableCount,
        }));
    }
}

export const ticketsService = new TicketsService();

