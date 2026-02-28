import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.userModel
      .find({ tenantId: this.toObjectId(tenantId, 'tenantId') })
      .lean()
      .exec();
  }

  async findOne(id: string, tenantId: string): Promise<User | null> {
    return this.userModel
      .findOne({
        _id: this.toObjectId(id, 'userId'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
      })
      .select('-password')
      .lean()
      .exec();
  }

  async create(createUserDto: any, tenantId: string): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = await this.userModel.create({
      ...createUserDto,
      email: String(createUserDto.email).toLowerCase().trim(),
      password: hashedPassword,
      tenantId: this.toObjectId(tenantId, 'tenantId'),
    });
    const obj = createdUser.toObject();
    delete (obj as any).password;
    return obj;
  }

  async update(
    id: string,
    updateUserDto: any,
    tenantId: string,
  ): Promise<User | null> {
    const update: any = { ...updateUserDto };
    if (update.email) {
      update.email = String(update.email).toLowerCase().trim();
    }
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const updated = await this.userModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id, 'userId'),
          tenantId: this.toObjectId(tenantId, 'tenantId'),
        },
        { $set: update },
        { new: true },
      )
      .select('-password')
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const res = await this.userModel
      .deleteOne({
        _id: this.toObjectId(id, 'userId'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
      })
      .exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}

