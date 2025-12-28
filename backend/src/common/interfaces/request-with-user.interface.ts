import { Request } from 'express';
import { Types } from 'mongoose';

export interface RequestUser {
  id?: string;
  _id?: Types.ObjectId | string;
  email?: string;
  role?: string;
  roleId?: Types.ObjectId | string;
  tenantId?: Types.ObjectId | string;
  userId?: string;
  sub?: string; // JWT subject
}

export interface RequestWithUser extends Request {
  user?: RequestUser;
}
