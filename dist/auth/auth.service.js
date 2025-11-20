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
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../schemas/user.schema");
const tenant_schema_1 = require("../schemas/tenant.schema");
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
        const { email, password, firstName, lastName, companyName, companySlug } = registerDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const existingTenant = await this.tenantModel.findOne({ slug: companySlug });
        if (existingTenant) {
            throw new common_1.ConflictException('Company slug already taken');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const tenant = await this.tenantModel.create({
            slug: companySlug,
            name: companyName,
            email: email,
            status: tenant_schema_1.TenantStatus.TRIAL,
            ownerId: null,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });
        const user = await this.userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: user_schema_1.UserRole.TENANT_OWNER,
            status: user_schema_1.UserStatus.ACTIVE,
            tenantId: tenant._id,
        });
        await this.tenantModel.findByIdAndUpdate(tenant._id, { ownerId: user._id });
        const token = this.generateToken(user);
        return {
            message: 'Registration successful',
            user: this.sanitizeUser(user),
            tenant: this.sanitizeTenant(tenant),
            token,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email }).populate('tenantId');
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== user_schema_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
        const token = this.generateToken(user);
        return {
            message: 'Login successful',
            user: this.sanitizeUser(user),
            tenant: user.tenantId ? this.sanitizeTenant(user.tenantId) : null,
            token,
        };
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
    async getUserById(userId) {
        const user = await this.userModel.findById(userId).populate('tenantId');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    generateToken(user) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?.toString(),
        };
        return this.jwtService.sign(payload);
    }
    sanitizeUser(user) {
        const { password, emailVerificationToken, passwordResetToken, twoFactorSecret, ...sanitized } = user.toObject();
        return sanitized;
    }
    sanitizeTenant(tenant) {
        if (!tenant)
            return null;
        const tenantObj = tenant.toObject ? tenant.toObject() : tenant;
        return tenantObj;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });
        return { message: 'Password changed successfully' };
    }
    async requestPasswordReset(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return { message: 'If email exists, password reset link has been sent' };
        }
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetExpires = new Date(Date.now() + 3600000);
        await this.userModel.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        });
        return {
            message: 'Password reset token generated',
            resetToken,
        };
    }
    async resetPassword(resetToken, newPassword) {
        const user = await this.userModel.findOne({
            passwordResetToken: resetToken,
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        });
        return { message: 'Password reset successful' };
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