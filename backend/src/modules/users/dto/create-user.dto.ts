export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;
  role?: 'admin' | 'owner' | 'user';
  isActive?: boolean;
  company?: string;
  tenantId?: string;
}

export class BulkCreateUserDto {
  users!: CreateUserDto[];
}
















