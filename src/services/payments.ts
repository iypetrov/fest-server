import dotenv from 'dotenv';
import Stripe from 'stripe';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

import { paymentsRepository } from '../repositories/payments';
import { TicketEntity, ticketsRepository } from '../repositories/tickets';
import { EventEntity, eventsRepository } from '../repositories/events';
import { UserEntity, usersRepository } from '../repositories/users';
import { Status } from '../services/tickets';
import { imagesService } from '../services/images';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia'
});

export interface PaymentModel {
    clientSecret: string,
    id: string;
    userId: string; 
    ticketId: string;
    providerId: string;
    price: number;
    createdAt: Date;
    finishedAt: Date | null;
}

class PaymentsService {
    constructor() {
        this.create = this.create.bind(this);
        this.getById = this.getById.bind(this);
        this.getPublishableKey = this.getPublishableKey.bind(this);
        this.handleWebhookEvent = this.handleWebhookEvent.bind(this);
    }

    public async create(
        userId: string,
        ticketId: string,
        price: number,
    ): Promise<PaymentModel | null> {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const payment = await paymentsRepository.create(
            userId,
            ticketId,
            paymentIntent.id,
            price
        );

        await ticketsRepository.updateTicketAfterPayment(ticketId, userId, Status.RESERVED);

        return {
            clientSecret: paymentIntent.client_secret,
            id: payment.id,
            userId: payment.userId.toString(),
            ticketId: payment.ticketId.toString(),
            providerId: payment.providerId,
            price: payment.price,
            createdAt: payment.createdAt,
            finishedAt: payment.finishedAt,
        };
    }

    public async getById(id: string): Promise<PaymentModel | null> {
        const payment = await paymentsRepository.findById(id);
        if (!payment) {
            return null;
        }

        return {
            clientSecret: "",
            id: payment.id,
            userId: payment.userId.toString(),
            ticketId: payment.ticketId.toString(),
            providerId: payment.providerId,
            price: payment.price,
            createdAt: payment.createdAt,
            finishedAt: payment.finishedAt,
        };
    }

    public async getPublishableKey(): Promise<string> {
        return process.env.STRIPE_PUBLISHABLE_KEY;
    }

    public async handleWebhookEvent(intentId: string): Promise<void> {
        try {
            const payment = await paymentsRepository.findByProviderId(intentId);
            let ticket = await ticketsRepository.findById(payment[0].ticketId.toString());
            const user = await usersRepository.findById(ticket.userId.toString());
            ticket = await ticketsRepository.updateTicketAfterPayment(
                payment[0].ticketId.toString(),
                user.id,
                Status.SOLD
            );
            await paymentsRepository.setFinishedAtByTicketId(ticket.id);
            console.log(`Ticket ${ticket.id} was purchased`);

            const event = await eventsRepository.findById(ticket.eventId.toString());

            await this.generateUploadAndSendTicket(ticket, event, user);
        } catch (error) {
            console.error("Failed to charge order:", error);
            throw new Error("Failed to process order charge");
        }
    }

    public async generateUploadAndSendTicket(
        ticket: TicketEntity,
        event: EventEntity,
        user: UserEntity
    ): Promise<void> {
        const invoice = this.generateTicketInvoiceHtml(ticket, event, user);
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(invoice);
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        const file = {
            buffer: pdfBuffer,
            mimetype: "application/pdf",
        } as Express.Multer.File;

        await imagesService.upload("tickets", `ticket-${ticket.id}.pdf`, file);

        await this.sendTicketEmail(user.email, Buffer.from(pdfBuffer));
    };

    public async sendTicketEmail(userEmail: string, ticketBuffer: Buffer): Promise<void> {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAILGUN_HOST || "smtp.mailgun.org",
                port: Number(process.env.MAILGUN_PORT) || 587,
                secure: false, 
                auth: {
                    user: process.env.MAILGUN_USER, 
                    pass: process.env.MAILGUN_PASS
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: `"TicketingPlatform" <no-reply@ticketingplatform.com>`,
                to: userEmail,
                subject: "Your Ticket for the Event",
                text: "Hello,\n\nAttached is your ticket for the event.\n\nThank you!",
                attachments: [
                    {
                        filename: "ticket.pdf",
                        content: ticketBuffer,
                        contentType: "application/pdf",
                    },
                ],
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Mailgun SMTP Response:", info);
        } catch (err) {
            console.error("Error sending email:", err);
            throw err;
        }
    };

    public generateTicketInvoiceHtml = (
        ticket: TicketEntity,
        event: EventEntity,
        user: UserEntity
    ): string => {
        return `
        <html>
        <head>
        <style>
        body {
            font-family: Arial, sans-serif;
            background: #f8f8f8;
            padding: 20px;
        }
        .ticket-container {
            width: 500px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .event-image {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 10px;
        }
        .event-name {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .ticket-details {
            font-size: 16px;
            margin: 10px 0;
        }
        .ticket-status {
            padding: 5px 10px;
            border-radius: 5px;
            color: #fff;
            display: inline-block;
        }
        .AVAILABLE { background: #28a745; }
        .RESERVED { background: #ffc107; }
        .SOLD { background: #dc3545; }
        .ticket-type {
            font-weight: bold;
            color: #007bff;
        }
        .footer {
            font-size: 12px;
            margin-top: 20px;
            color: #888;
        }
        </style>
        </head>
        <body>
        <div class="ticket-container">
        <img src="${event.thumbnailUrl}" alt="Event Image" class="event-image" />

        <div class="event-name">${event.name}</div>
        <div class="ticket-details">
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Date:</strong> ${new Date(event.startTime).toLocaleDateString()} - ${new Date(event.endTime).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startTime).toLocaleTimeString()} - ${new Date(event.endTime).toLocaleTimeString()}</p>
        </div>

        <hr />

        <div class="ticket-details">
        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
        <p><strong>Holder:</strong> ${user.email}</p>
        <p><strong>Price:</strong> $${ticket.price.toFixed(2)}</p>
        <p class="ticket-status ${ticket.status}">${ticket.status}</p>
        <p class="ticket-type">${ticket.type} Ticket</p>
        </div>

        <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Event ID: ${event.id} | User ID: ${user.id}</p>
        </div>
        </div>
        </body>
        </html>
        `;
    };
}

export const paymentsService = new PaymentsService();

