import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

export type PermissionAction = 'manage' | 'create' | 'edit' | 'delete' | 'show';

// Module names that match the screenshots
export type ModuleName =
  | 'User'
  | 'Role'
  | 'Client'
  | 'Product & service'
  | 'Constant unit'
  | 'Constant tax'
  | 'Constant category'
  | 'Account'
  | 'HRM'
  | 'Expense'
  | 'Invoice'
  | 'Department'
  | 'Designation'
  | 'Branch'
  | 'Document Type'
  | 'Zoom meeting'
  | 'Employee'
  | 'POS';

@Schema({ timestamps: true })
export class Permission {
  @Prop({
    type: String,
    required: true,
    enum: ['manage', 'create', 'edit', 'delete', 'show'],
  })
  action!: PermissionAction;

  @Prop({
    type: String,
    required: true,
    enum: [
      'User',
      'Role',
      'Client',
      'Product & service',
      'Constant unit',
      'Constant tax',
      'Constant category',
      'Account',
      'HRM',
      'Expense',
      'Invoice',
      'Department',
      'Designation',
      'Branch',
      'Document Type',
      'Zoom meeting',
      'Employee',
      'POS',
    ],
  })
  module!: ModuleName;

  @Prop({ required: false })
  description!: string;

  /**
   * Optional: List of allowed fields for this permission (for per-field access control)
   */
  @Prop({ type: [String], required: false, default: undefined })
  fields?: string[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Create a compound index for unique action+module combination
PermissionSchema.index({ action: 1, module: 1 }, { unique: true });
