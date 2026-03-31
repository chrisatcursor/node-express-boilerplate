import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');
import catchAsync = require('../utils/catchAsync');

// @ts-expect-error: services barrel is still JS in this migration phase
import { userService } from '../services';

interface UserBody {
  email?: string;
  password?: string;
  name?: string;
  role?: 'user' | 'admin';
}

interface UserService {
  createUser(userBody: UserBody): Promise<unknown>;
  queryUsers(filter: Record<string, unknown>, options: Record<string, unknown>): Promise<unknown>;
  getUserById(userId: string): Promise<unknown>;
  updateUserById(userId: string, updateBody: UserBody): Promise<unknown>;
  deleteUserById(userId: string): Promise<unknown>;
}

const typedUserService = userService as UserService;

interface UserParams {
  userId: string;
}

interface GetUsersQuery {
  name?: string;
  role?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

const createUser: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const user = await typedUserService.createUser(req.body as UserBody);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const query = req.query as unknown as GetUsersQuery;
  const filter = pick(query, ['name', 'role']);
  const options = pick(query, ['sortBy', 'limit', 'page']);
  const result = await typedUserService.queryUsers(filter, options);
  res.send(result);
});

const getUser: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { userId } = req.params as unknown as UserParams;
  const user = await typedUserService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { userId } = req.params as unknown as UserParams;
  const user = await typedUserService.updateUserById(userId, req.body as UserBody);
  res.send(user);
});

const deleteUser: RequestHandler = catchAsync(async (req, res): Promise<void> => {
  const { userId } = req.params as unknown as UserParams;
  await typedUserService.deleteUserById(userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export { createUser, getUsers, getUser, updateUser, deleteUser };
