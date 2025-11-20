"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../schemas/user.schema");
const tenant_schema_1 = require("../schemas/tenant.schema");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    userModel;
    tenantModel;
    jwtService;
    constructor(userModel, tenantModel, jwtService) {
        this.userModel = userModel;
        this.tenantModel = tenantModel;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, tenantName } = registerDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const slug = tenantName.toLowerCase().replace(/\s+/g, '-');
        const existingTenant = await this.tenantModel.findOne({ slug });
        if (existingTenant) {
            throw new common_1.ConflictException('A tenant with this name already exists');
        }
        const tenant = new this.tenantModel({
            name: tenantName,
            slug,
            status: tenant_schema_1.TenantStatus.TRIAL,
            isActive: true,
            subscriptionTier: 'trial',
        });
        await tenant.save();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            tenant: tenant._id,
            role: user_schema_1.UserRole.TENANT_OWNER,
            status: user_schema_1.UserStatus.ACTIVE,
            isActive: true,
        });
        await user.save();
        const payload = {
            sub: user._id,
            email: user.email,
            tenant: tenant._id,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: this.sanitizeUser(user),
            tenant: this.sanitizeTenant(tenant),
            accessToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email }).populate('tenant');
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== user_schema_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user._id,
            email: user.email,
            tenant: user.tenant,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: this.sanitizeUser(user),
            tenant: user.tenant ? this.sanitizeTenant(user.tenant) : null,
            accessToken,
        };
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (user.status !== user_schema_1.UserStatus.ACTIVE) {
            return null;
        }
        return user;
    }
    async getUserById(userId) {
        const user = await this.userModel.findById(userId).populate('tenant');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: this.sanitizeUser(user),
            tenant: user.tenant ? this.sanitizeTenant(user.tenant) : null,
        };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return { message: 'Password changed successfully' };
    }
    async requestPasswordReset(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return { message: 'If a user with that email exists, a password reset link has been sent' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();
        return {
            message: 'If a user with that email exists, a password reset link has been sent',
            resetToken,
        };
    }
    async resetPassword(resetToken, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await this.userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return { message: 'Password has been reset successfully' };
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId).populate('tenant');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: this.sanitizeUser(user),
            tenant: user.tenant ? this.sanitizeTenant(user.tenant) : null,
        };
    }
    sanitizeUser(user) {
        const { password, resetPasswordToken, resetPasswordExpires, ...sanitized } = user.toObject();
        return sanitized;
    }
    sanitizeTenant(tenant) {
        return tenant.toObject();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map