import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: any): Promise<any> {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      ...dto,
      password: hashedPassword,
    });

    const { password, ...result } = user.toObject();
    const token = this.jwtService.sign({ sub: user._id, email: user.email });

    return {
      user: result,
      accessToken: token,
      refreshToken: this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' }),
    };
  }

  async login(dto: any): Promise<any> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user.toObject();
    const token = this.jwtService.sign({ sub: user._id, email: user.email });

    return {
      user: result,
      accessToken: token,
      refreshToken: this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' }),
    };
  }
}
