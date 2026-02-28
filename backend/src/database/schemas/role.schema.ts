import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  description!: string;

  // Tenant ID - if null, this is a platform-level role
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
  tenantId!: Types.ObjectId;

  // Whether this is a default/system role that cannot be deleted
  @Prop({ default: false })
  isSystem!: boolean;

  // Array of permission IDs assigned to this role
  @Prop({ type: [Types.ObjectId], ref: 'Permission', default: [] })
  permissions!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Index for finding tenant-specific roles
RoleSchema.index(
  { tenantId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { tenantId: { $type: 'objectId' } },
  },
);
