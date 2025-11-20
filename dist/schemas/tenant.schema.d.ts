import { Document } from 'mongoose';
export type TenantDocument = Tenant & Document;
export declare enum TenantStatus {
    ACTIVE = "active",
    TRIAL = "trial",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled"
}
export declare class Tenant {
    name: string;
    slug: string;
    status: TenantStatus;
    isActive: boolean;
    subscriptionTier: string;
    subscriptionExpiresAt?: Date;
}
export declare const TenantSchema: import("mongoose").Schema<Tenant, import("mongoose").Model<Tenant, any, any, any, Document<unknown, any, Tenant, any, {}> & Tenant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tenant, Document<unknown, {}, import("mongoose").FlatRecord<Tenant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Tenant> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
