import { Document, Schema as MongooseSchema } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    TENANT_OWNER = "tenant_owner",
    ADMIN = "admin",
    MANAGER = "manager",
    USER = "user"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    tenant: MongooseSchema.Types.ObjectId;
    role: UserRole;
    status: UserStatus;
    isActive: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
