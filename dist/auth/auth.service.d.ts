import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../schemas/user.schema';
import { TenantDocument } from '../schemas/tenant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userModel;
    private tenantModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, tenantModel: Model<TenantDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: any;
        tenant: any;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: any;
        tenant: any;
        token: string;
    }>;
    validateUser(email: string, password: string): Promise<any>;
    getUserById(userId: string): Promise<UserDocument>;
    generateToken(user: UserDocument): string;
    private sanitizeUser;
    private sanitizeTenant;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
