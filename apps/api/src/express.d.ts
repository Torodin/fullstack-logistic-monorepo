import { UserReqPayload } from "./users/types/user-req-payload.type";

declare module "express" {
    export interface Request {
        user?: UserReqPayload;
    }
}
