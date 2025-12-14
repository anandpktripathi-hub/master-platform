import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from '../../common/enums/permission.enum';

@Schema({ timestamps: true })
export class RuntimeRole extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: Permission[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  description?: string;
}

export const RuntimeRoleSchema = SchemaFactory.createForClass(RuntimeRole);
