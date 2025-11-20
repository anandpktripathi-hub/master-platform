import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    TENANT_OWNER = "tenant_owner",
    TENANT_ADMIN = "tenant_admin",
    TENANT_USER = "tenant_user"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending"
}
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    tenantId: Types.ObjectId;
    profileImage: string;
    phoneNumber: string;
    preferences: Record<string, any>;
    lastLoginAt: Date;
    emailVerifiedAt: Date;
    emailVerificationToken: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    isTwoFactorEnabled: boolean;
    twoFactorSecret: string;
    permissions: string[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
