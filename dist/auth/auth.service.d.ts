import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../schemas/user.schema';
import { TenantDocument } from '../schemas/tenant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private userModel;
    private tenantModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, tenantModel: Model<TenantDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: any;
        tenant: any;
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: any;
        tenant: any;
        accessToken: string;
    }>;
    validateUser(email: string, password: string): Promise<any>;
    getUserById(userId: string): Promise<{
        user: any;
        tenant: any;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
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
    getProfile(userId: string): Promise<{
        user: any;
        tenant: any;
    }>;
    private sanitizeUser;
    private sanitizeTenant;
}
