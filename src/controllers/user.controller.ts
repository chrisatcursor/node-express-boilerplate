import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
// @ts-expect-error: services remain JavaScript in current migration stage
import { userService } from '../services';

const createUser: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as Record<string, unknown>;
  const filter = pick(query, ['name', 'role']);
  const options = pick(query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser: RequestHandler = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export { createUser, getUsers, getUser, updateUser, deleteUser };
