import { Role } from '@fullstack-logistic-wrk/prisma/generated';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}
