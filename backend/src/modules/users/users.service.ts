import * as bcrypt from 'bcryptjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any) {
    const existing = await this.userModel.findOne({ email: createUserDto.email }).select('_id').lean();
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const doc = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'user',
      isActive: createUserDto.isActive !== false,
      company: createUserDto.company || '',
    });

    const userObj: any = doc.toObject();
    delete userObj.password;
    return userObj;
  }

  async bulkCreate(users: any[]) {
    if (!Array.isArray(users) || users.length === 0) {
      return { insertedCount: 0, errors: ['No users provided'] };
    }

    const docs = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        return {
          ...u,
          password: hashedPassword,
          role: u.role || 'user',
          isActive: u.isActive !== false,
          company: u.company || '',
        };
      }),
    );

    const result = await this.userModel.insertMany(docs, { ordered: false });
    const insertedCount = result.length;

    return {
      insertedCount,
    };
  }

  async findAll(page = 1, limit = 10): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().select('-password').skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments(),
    ]);
    return { data: users, total };
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateDto: any): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
