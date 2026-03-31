import type { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};
