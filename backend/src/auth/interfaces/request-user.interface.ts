export interface RequestUser {
  userId: string;
  email: string;
  roles: string[];
  sub: string; // JWT subject
  // ...other properties...
}
