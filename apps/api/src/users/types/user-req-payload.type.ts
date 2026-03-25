import { User } from "@fullstack-logistic-wrk/prisma";

export type UserReqPayload = Pick<User, "id" | "email" | "role">;
