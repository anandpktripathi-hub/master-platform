import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VCard, VCardDocument } from '../../database/schemas/vcard.schema';

@Injectable()
export class VcardsService {
  constructor(
    @InjectModel(VCard.name) private readonly vcardModel: Model<VCardDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  async listForTenant(tenantId: string): Promise<VCard[]> {
    return this.vcardModel
      .find({ tenantId: this.toObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createForTenant(
    tenantId: string,
    payload: Partial<VCard>,
  ): Promise<VCard> {
    const doc = new this.vcardModel({
      ...payload,
      tenantId: this.toObjectId(tenantId),
    });
    return doc.save();
  }

  async updateForTenant(
    tenantId: string,
    id: string,
    payload: Partial<VCard>,
  ): Promise<VCard> {
    const updated = await this.vcardModel
      .findOneAndUpdate(
        { _id: this.toObjectId(id), tenantId: this.toObjectId(tenantId) },
        { $set: payload },
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
        _id: this.toObjectId(id),
        tenantId: this.toObjectId(tenantId),
      })
      .exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('vCard not found');
    }
  }

  async getPublicVcard(id: string): Promise<VCard> {
    const vcard = await this.vcardModel
      .findById(this.toObjectId(id))
      .lean()
      .exec();
    if (!vcard) {
      throw new NotFoundException('vCard not found');
    }
    return vcard as unknown as VCard;
  }
}
