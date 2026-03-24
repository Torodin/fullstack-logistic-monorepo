import { Role } from "@fullstack-logistic-wrk/prisma";

export class CreateUserDto {
  email: string;
  name?: string;
  password: string;
  role?: Role;
}
