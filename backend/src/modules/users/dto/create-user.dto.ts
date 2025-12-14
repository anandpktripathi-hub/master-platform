import { RoleUnion } from '../role.types';
export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;
  role?: RoleUnion;
  isActive?: boolean;
  company?: string;
  tenantId?: string;
}

export class BulkCreateUserDto {
  users!: CreateUserDto[];
}
