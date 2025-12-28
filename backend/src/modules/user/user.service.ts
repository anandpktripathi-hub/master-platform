import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.userModel.find({ tenantId }).exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async create(createUserDto: User, tenantId: string): Promise<User> {
    const createdUser = new this.userModel({ ...createUserDto, tenantId });
    return createdUser.save();
  }

  async update(
    id: string,
    updateUserDto: User,
    tenantId: string,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { ...updateUserDto, tenantId }, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
