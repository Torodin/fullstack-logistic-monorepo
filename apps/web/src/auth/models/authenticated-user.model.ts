import { Role } from '@fullstack-logistic-wrk/prisma';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}
