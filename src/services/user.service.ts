import mongoose from 'mongoose';
import httpStatus from 'http-status';
import ApiError = require('../utils/ApiError');
import { User } from '../models';
import type { IUser, QueryResult, PaginateOptions } from '../models';

type CreateUserBody = Pick<IUser, 'email' | 'name' | 'password'> & Partial<Pick<IUser, 'role' | 'isEmailVerified'>>;
type UpdateUserBody = Partial<Pick<IUser, 'email' | 'name' | 'password' | 'role' | 'isEmailVerified'>>;
type UserId = string | mongoose.Types.ObjectId;

const createUser = async (userBody: CreateUserBody): Promise<IUser> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const queryUsers = async (filter: Record<string, unknown>, options: PaginateOptions): Promise<QueryResult> => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id: UserId): Promise<IUser | null> => {
  return User.findById(id);
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

const updateUserById = async (userId: UserId, updateBody: UpdateUserBody): Promise<IUser> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, user._id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId: UserId): Promise<IUser> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

export { createUser, queryUsers, getUserById, getUserByEmail, updateUserById, deleteUserById };
