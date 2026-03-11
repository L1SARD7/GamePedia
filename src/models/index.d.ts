import { UserInfoModel } from "./UserViewModel";


declare global {
  namespace Express {
    export interface Request {
      user: UserInfoModel | null;
    }
  }
}
