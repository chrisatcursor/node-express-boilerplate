import httpStatus from 'http-status';
import { FilterQuery, Types } from 'mongoose';
import { PaginateOptions, QueryResult } from '../models/plugins';
import { User, IUserDocument } from '../models';
import ApiError from '../utils/ApiError';
import { CreateUserBody, UpdateUserBody } from '../validations/user.validation';

export type NewUserBody = Omit<CreateUserBody, 'role'> & Partial<Pick<CreateUserBody, 'role'>>;
export type UserUpdateBody = UpdateUserBody & { isEmailVerified?: boolean };

export const createUser = async (userBody: NewUserBody): Promise<IUserDocument> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  return User.create(userBody);
};

export const queryUsers = async (
  filter: FilterQuery<IUserDocument>,
  options: PaginateOptions
): Promise<QueryResult<IUserDocument>> => {
  return User.paginate(filter, options);
};

export const getUserById = async (id: Types.ObjectId | string): Promise<IUserDocument | null> => {
  return User.findById(id);
};

export const getUserByEmail = async (email: string): Promise<IUserDocument | null> => {
  return User.findOne({ email });
};

export const updateUserById = async (
  userId: Types.ObjectId | string,
  updateBody: UserUpdateBody
): Promise<IUserDocument> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Object.assign(user, updateBody);
  await user.save();

  return user;
};

export const deleteUserById = async (userId: Types.ObjectId | string): Promise<IUserDocument> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.remove();

  return user;
};
