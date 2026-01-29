import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SettingDocument = Setting & Document;

// Scope determines whether a setting applies globally (SaaS-wide)
// or is tenant-specific. This matches SettingScope in upsert-settings.dto.ts
export type SettingScope = 'GLOBAL' | 'TENANT';

@Schema({ timestamps: true })
export class Setting {
	@Prop({ required: true })
	group!: string; // e.g. "basic", "system", "branding", "email", "payment", "integrations"

	@Prop({ required: true })
	key!: string; // setting key inside the group

	@Prop({ required: true, enum: ['GLOBAL', 'TENANT'], default: 'GLOBAL' })
	scope!: SettingScope;

	@Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
	tenantId?: Types.ObjectId | null;

	@Prop({ type: String, required: false })
	locale?: string | null;

	// Arbitrary JSON value for this setting (string, number, object, etc.)
	@Prop({ type: MongooseSchema.Types.Mixed, required: true })
	value!: any;

	@Prop({ default: true })
	isActive!: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

// Helpful indexes for fast lookups
SettingSchema.index({ group: 1, key: 1, scope: 1, tenantId: 1, locale: 1 }, {
	unique: true,
});
