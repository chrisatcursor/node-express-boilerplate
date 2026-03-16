import type { IUserDocument } from '../models/user.model';

declare global {
  namespace Express {
    interface User extends IUserDocument {}

    interface Request {
      user?: IUserDocument;
    }

    interface Locals {
      errorMessage?: string;
    }
  }
}

export {};
