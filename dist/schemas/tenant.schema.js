"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSchema = exports.Tenant = exports.TenantStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["TRIAL"] = "trial";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["CANCELLED"] = "cancelled";
    TenantStatus["EXPIRED"] = "expired";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
let Tenant = class Tenant {
    slug;
    name;
    email;
    logo;
    domain;
    status;
    ownerId;
    currentSubscriptionId;
    settings;
    branding;
    features;
    usage;
    limits;
    trialEndsAt;
    subscriptionEndsAt;
    metadata;
};
exports.Tenant = Tenant;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Tenant.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Tenant.prototype, "domain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: TenantStatus, default: TenantStatus.TRIAL }),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Tenant.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subscription', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Tenant.prototype, "currentSubscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Tenant.prototype, "branding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Tenant.prototype, "features", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: { storage: 0, users: 0, api_calls: 0 } }),
    __metadata("design:type", Object)
], Tenant.prototype, "usage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: { storage: 5000, users: 10, api_calls: 10000 } }),
    __metadata("design:type", Object)
], Tenant.prototype, "limits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Tenant.prototype, "trialEndsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Tenant.prototype, "subscriptionEndsAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Tenant.prototype, "metadata", void 0);
exports.Tenant = Tenant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Tenant);
exports.TenantSchema = mongoose_1.SchemaFactory.createForClass(Tenant);
exports.TenantSchema.index({ slug: 1 }, { unique: true });
exports.TenantSchema.index({ email: 1 }, { unique: true });
exports.TenantSchema.index({ ownerId: 1 });
exports.TenantSchema.index({ status: 1 });
//# sourceMappingURL=tenant.schema.js.map