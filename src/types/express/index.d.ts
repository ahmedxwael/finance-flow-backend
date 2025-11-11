import { User } from "@/modules/users/types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; // 👈 this ensures TS treats it as a module
