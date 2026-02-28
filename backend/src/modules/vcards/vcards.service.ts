import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VCard, VCardDocument } from '../../database/schemas/vcard.schema';

@Injectable()
export class VcardsService {
  constructor(
    @InjectModel(VCard.name) private readonly vcardModel: Model<VCardDocument>,
  ) {}

  private static normalizeUpsertPayload(payload: unknown): Record<string, unknown> {
    if (!payload || typeof payload !== 'object') return {};
    return payload as Record<string, unknown>;
  }

  private toObjectId(id: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(id);
  }

  async listForTenant(tenantId: string): Promise<VCard[]> {
    return this.vcardModel
      .find({ tenantId: this.toObjectId(tenantId, 'tenantId') })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createForTenant(
    tenantId: string,
    payload: unknown,
  ): Promise<VCard> {
    const docPayload: any = {
      ...VcardsService.normalizeUpsertPayload(payload),
    };

    if (docPayload.userId) {
      docPayload.userId = this.toObjectId(String(docPayload.userId), 'userId');
    }
    const doc = new this.vcardModel({
      ...docPayload,
      tenantId: this.toObjectId(tenantId, 'tenantId'),
    });
    return doc.save();
  }

  async updateForTenant(
    tenantId: string,
    id: string,
    payload: unknown,
  ): Promise<VCard> {
    const updatePayload: any = {
      ...VcardsService.normalizeUpsertPayload(payload),
    };
    if (updatePayload.userId) {
      updatePayload.userId = this.toObjectId(String(updatePayload.userId), 'userId');
    }
    const updated = await this.vcardModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id, 'vcardId'),
          tenantId: this.toObjectId(tenantId, 'tenantId'),
        },
        { $set: updatePayload },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('vCard not found');
    }
    return updated as unknown as VCard;
  }

  async deleteForTenant(tenantId: string, id: string): Promise<void> {
    const res = await this.vcardModel
      .deleteOne({
        _id: this.toObjectId(id, 'vcardId'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
      })
      .exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('vCard not found');
    }
  }

  async getPublicVcard(id: string): Promise<VCard> {
    const vcard = await this.vcardModel
      .findById(this.toObjectId(id, 'vcardId'))
      .lean()
      .exec();
    if (!vcard) {
      throw new NotFoundException('vCard not found');
    }
    return vcard as unknown as VCard;
  }
}

