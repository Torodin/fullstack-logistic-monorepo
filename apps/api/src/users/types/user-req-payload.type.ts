import { User } from "@fullstack-logistic-wrk/prisma/generated";

export type UserReqPayload = Pick<User, "id" | "email" | "role">;
