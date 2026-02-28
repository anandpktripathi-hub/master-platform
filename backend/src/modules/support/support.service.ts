import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from '../../database/schemas/ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  private toOptionalObjectId(
    value: string | undefined,
    fieldName: string,
  ): Types.ObjectId | undefined {
    if (!value) return undefined;
    return this.toObjectId(value, fieldName);
  }

  async createTicket(params: {
    userId: string;
    tenantId?: string;
    subject: string;
    message: string;
  }) {
    const subject = String(params.subject ?? '').trim();
    const message = String(params.message ?? '').trim();
    if (!subject) throw new BadRequestException('subject is required');
    if (!message) throw new BadRequestException('message is required');

    const doc = await this.ticketModel.create({
      userId: this.toObjectId(params.userId, 'userId'),
      tenantId: this.toOptionalObjectId(params.tenantId, 'tenantId'),
      subject,
      message,
      status: 'open',
      priority: 'low',
    });
    return doc.toObject();
  }

  async listMyTickets(userId: string, tenantId?: string) {
    return this.ticketModel
      .find({
        userId: this.toObjectId(userId, 'userId'),
        ...(tenantId
          ? { tenantId: this.toObjectId(tenantId, 'tenantId') }
          : {}),
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async listAllTickets() {
    return this.ticketModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async updateStatus(id: string, status: TicketDocument['status']) {
    const updated = await this.ticketModel
      .findByIdAndUpdate(
        this.toObjectId(id, 'ticketId'),
        { status },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }
}

