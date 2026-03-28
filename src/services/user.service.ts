import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { User } from '../models';
import type { PaginateOptions, QueryResult } from '../models/plugins';
import type { IUser } from '../models/user.model';
import ApiError from '../utils/ApiError';

type NewUserBody = Pick<IUser, 'email' | 'password' | 'name'> & Partial<Pick<IUser, 'role'>>;
type UpdateUserBody = Partial<Pick<IUser, 'email' | 'password' | 'name' | 'isEmailVerified'>>;

const createUser = async (userBody: NewUserBody): Promise<IUser> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const queryUsers = async (filter: Record<string, unknown>, options: PaginateOptions): Promise<QueryResult> => {
  return User.paginate(filter, options);
};

const getUserById = async (id: mongoose.Types.ObjectId | string): Promise<IUser | null> => {
  return User.findById(id);
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

const updateUserById = async (userId: mongoose.Types.ObjectId | string, updateBody: UpdateUserBody): Promise<IUser> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Use the persisted user _id to avoid false positives when userId is string.
  const excludeUserId = user._id as mongoose.Types.ObjectId;
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, excludeUserId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId: mongoose.Types.ObjectId | string): Promise<IUser> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

export { createUser, queryUsers, getUserById, getUserByEmail, updateUserById, deleteUserById };
