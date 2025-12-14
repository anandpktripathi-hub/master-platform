import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAllPlatform(): Promise<User[]> {
    return this.userModel.find().lean().exec();
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.userModel.find({ tenantId }).lean().exec();
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: new Types.ObjectId(id), tenantId })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found in this tenant');
    }

    return user;
  }

  async findMe(userId: string | null): Promise<User | null> {
    if (!userId) return null;
    return this.userModel.findById(userId).lean().exec();
  }

  async create(createUserDto: User, tenantId: string): Promise<User> {
    const created = new this.userModel({
      ...createUserDto,
      tenantId,
    });
    return created.save();
  }

  async update(
    id: string,
    updateUserDto: User,
    tenantId: string,
  ): Promise<User> {
    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId },
        updateUserDto,
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found in this tenant');
    }

    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const res = await this.userModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), tenantId })
      .exec();

    if (!res) {
      throw new NotFoundException('User not found in this tenant');
    }
  }
}
