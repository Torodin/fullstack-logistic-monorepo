import { Role } from "@fullstack-logistic-wrk/prisma";

export class LoginDto {
  email: string;
  name?: string;
  password: string;
  role?: Role;
}
