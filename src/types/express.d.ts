import type { IUser } from '../models/user.model';

declare global {
  namespace Express {
    // Merge our user model fields into Express.User for auth middleware usage.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}

export {};
