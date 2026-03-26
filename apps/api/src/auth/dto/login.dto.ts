import { Role } from "@fullstack-logistic-wrk/prisma/generated";

export class LoginDto {
  email: string;
  name?: string;
  password: string;
  role?: Role;
}
