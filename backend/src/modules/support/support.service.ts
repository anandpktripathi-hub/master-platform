import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from '../../database/schemas/ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async createTicket(params: {
    userId: string;
    tenantId?: string;
    subject: string;
    message: string;
  }) {
    const doc = await this.ticketModel.create({
      userId: new Types.ObjectId(params.userId),
      tenantId: params.tenantId
        ? new Types.ObjectId(params.tenantId)
        : undefined,
      subject: params.subject,
      message: params.message,
      status: 'open',
      priority: 'low',
    });
    return doc.toObject();
  }

  async listMyTickets(userId: string) {
    return this.ticketModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async listAllTickets() {
    return this.ticketModel.find().sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, status: TicketDocument['status']) {
    const updated = await this.ticketModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }
}
