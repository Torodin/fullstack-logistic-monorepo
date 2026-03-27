import type { Role } from '@fullstack-logistic-wrk/prisma/generated';

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}
