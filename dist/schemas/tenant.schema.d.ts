import { Document, Types } from 'mongoose';
export type TenantDocument = Tenant & Document;
export declare enum TenantStatus {
    ACTIVE = "active",
    TRIAL = "trial",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare class Tenant {
    slug: string;
    name: string;
    email: string;
    logo: string;
    domain: string;
    status: TenantStatus;
    ownerId: Types.ObjectId;
    currentSubscriptionId: Types.ObjectId;
    settings: {
        timezone?: string;
        currency?: string;
        language?: string;
        dateFormat?: string;
        timeFormat?: string;
    };
    branding: {
        primaryColor?: string;
        secondaryColor?: string;
        logoUrl?: string;
        faviconUrl?: string;
    };
    features: {
        hrRecruitment?: boolean;
        pageBuilder?: boolean;
        blog?: boolean;
        ecommerce?: boolean;
        analytics?: boolean;
        emailMarketing?: boolean;
    };
    usage: {
        storage: number;
        users: number;
        api_calls: number;
    };
    limits: {
        storage: number;
        users: number;
        api_calls: number;
    };
    trialEndsAt: Date;
    subscriptionEndsAt: Date;
    metadata: Record<string, any>;
}
export declare const TenantSchema: import("mongoose").Schema<Tenant, import("mongoose").Model<Tenant, any, any, any, Document<unknown, any, Tenant, any, {}> & Tenant & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tenant, Document<unknown, {}, import("mongoose").FlatRecord<Tenant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Tenant> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
